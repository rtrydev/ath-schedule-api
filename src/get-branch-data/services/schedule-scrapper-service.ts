import axios from "axios";
import {JSDOM} from "jsdom";
import {FeedItem} from "../models/feed-item";
import {ScheduleItem} from "../models/schedule-item";
import {Service} from "typedi";

@Service()
export class ScheduleScrapperService {
    async getBranchData(type: string, branch: string, link: string) {
        const response = await axios.post(
            `https://plany.ath.bielsko.pl/left_menu_feed.php?type=${type}&branch=${branch}&link=${link}`
        );

        return this.scrapBranchData(response.data);
    }

    async getBaseBranch() {
        const response = await axios.get("https://plany.ath.bielsko.pl/left_menu.php");

        return this.scrapBaseBranch(response.data);
    }

    private scrapBaseBranch(html: string) {
        const dom = new JSDOM(html);
        const feedItems: FeedItem[] = [];

        dom.window.document.querySelectorAll('li').forEach(
            li => {
                const branchCall = li.querySelector('a')?.getAttribute('onclick') || '';
                const branchCallParams = branchCall
                    .replace('branch(', '')
                    .replace(');', '')
                    .replace('\'', '')
                    .split(',');

                feedItems.push({
                    type: branchCallParams[0],
                    branch: branchCallParams[1],
                    link: branchCallParams[2],
                    title: branchCallParams[3].replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\- ]/g, '')
                });
            }
        );

        return feedItems;
    }

    private scrapBranchData(html: string) {
        const dom = new JSDOM(html);
        const feedItems: FeedItem[] = [];
        const scheduleItems: ScheduleItem[] = [];

        dom.window.document.querySelector('ul')?.querySelectorAll('li')
            .forEach(li => {
                console.log(li.outerHTML);
                const img = li.querySelector('img');

                if (!img) {
                    return;
                }

                if (!img.getAttribute('onclick')) {
                    const anchor = li.querySelector('a');

                    const scheduleFetchCall = anchor?.getAttribute('href') || '';

                    const typeRegexResult = /type=([0-9]+)/g.exec(scheduleFetchCall);
                    const type = typeRegexResult && typeRegexResult[1] ? typeRegexResult[1] : '';

                    const idRegexResult = /id=([0-9]+)/g.exec(scheduleFetchCall);
                    const id = idRegexResult && idRegexResult[1] ? idRegexResult[1] : ''

                    scheduleItems.push({
                        id,
                        type,
                        title: anchor?.textContent || ''
                    });

                    return;
                }

                const branchCall = img.getAttribute('onclick') || '';
                const branchCallParams = branchCall
                    .replace(/[^0-9,]/g, '')
                    .split(',');

                feedItems.push({
                    type: branchCallParams[3],
                    branch: branchCallParams[0],
                    link: branchCallParams[4],
                    title: (li.textContent || '')
                        .replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\- ]/g, '')
                        .replace(/[ ]{2,}/g, '')
                });
            });

        return feedItems.length ? feedItems : scheduleItems;
    }
}
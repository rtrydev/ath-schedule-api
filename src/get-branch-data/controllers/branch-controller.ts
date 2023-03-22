import {Inject, Service} from "typedi";
import {ScheduleScrapperService} from "../services/schedule-scrapper-service";
import {ScheduleBranchesDynamodb} from "../infrastructure/dynamodb/schedule-branches-dynamodb";

@Service()
export class BranchController {
    @Inject()
    private scheduleScrapperService: ScheduleScrapperService;
    @Inject()
    private scheduleBranchesDynamodb: ScheduleBranchesDynamodb;

    async getBranchData(type: string, branch: string, link: string) {
        const maxAge = 60 * 60 * 24 * 2;
        const cachedBranchData = await this.scheduleBranchesDynamodb.getItem(branch);

        if (cachedBranchData) {
            return JSON.parse(cachedBranchData.branchData);
        }

        const fetchedBranchData = await this.scheduleScrapperService.getBranchData(type, branch, link);

        await this.scheduleBranchesDynamodb.addItem({
            branchId: branch,
            ttl: new Date().getTime() / 1000 + maxAge,
            branchData: JSON.stringify(fetchedBranchData)
        });

        return fetchedBranchData;
    }

    async getBaseBranch() {
        const maxAge = 60 * 60 * 24 * 7;
        const cachedBranchData = await this.scheduleBranchesDynamodb.getItem('base');

        if (cachedBranchData) {
            return JSON.parse(cachedBranchData.branchData);
        }

        const fetchedBranchData = await this.scheduleScrapperService.getBaseBranch();

        await this.scheduleBranchesDynamodb.addItem({
            branchId: 'base',
            ttl: new Date().getTime() / 1000 + maxAge,
            branchData: JSON.stringify(fetchedBranchData)
        });

        return fetchedBranchData;
    }
}
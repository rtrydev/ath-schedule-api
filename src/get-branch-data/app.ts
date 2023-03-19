import 'reflect-metadata';
import {Container} from "typedi";
import {BranchController} from "./controllers/branch-controller";
import {FeedItem} from "./models/feed-item";
import {ScheduleItem} from "./models/schedule-item";

export const getBranchData = async (event: any) => {
    const branchParams = {
        type: event.queryStringParameters?.type,
        branch: event.queryStringParameters?.branch,
        link: event.queryStringParameters?.link
    };

    const branchController = Container.get(BranchController);

    let branchData: FeedItem[] | ScheduleItem[];

    if (!branchParams.branch || !branchParams.type || !branchParams.link) {
        branchData = await branchController.getBaseBranch();
    } else {
        branchData = await branchController.getBranchData(
            branchParams.type,
            branchParams.branch,
            branchParams.link
        );
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            branchData
        }),
        headers: {
            'content-type': 'application/json'
        }
    };
}
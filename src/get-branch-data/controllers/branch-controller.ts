import {Inject, Service} from "typedi";
import {ScheduleScrapperService} from "../services/schedule-scrapper-service";

@Service()
export class BranchController {
    @Inject()
    private scheduleScrapperService: ScheduleScrapperService;

    async getBranchData(type: string, branch: string, link: string) {
        return await this.scheduleScrapperService.getBranchData(type, branch, link);
    }

    async getBaseBranch() {
        return await this.scheduleScrapperService.getBaseBranch();
    }
}
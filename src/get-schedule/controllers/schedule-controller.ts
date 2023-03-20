import {Inject, Service} from "typedi";
import {ScheduleFetchService} from "../services/schedule-fetch-service";
import {ScheduleParseService} from "../services/schedule-parse-service";
import {ScheduleFetchParams} from "../models/schedule-fetch-params";

@Service()
export class ScheduleController {
    @Inject()
    private scheduleFetchService: ScheduleFetchService;
    @Inject()
    private scheduleParseService: ScheduleParseService;

    async getSchedule(params: ScheduleFetchParams) {
        await this.scheduleFetchService.fetchIcsFile(params.id, params.type);

        let schedule = this.scheduleParseService.parseIcsToJson(`/tmp/${params.id}.ics`);

        if (params.fromDate) {
            schedule = schedule.filter(scheduleItem => scheduleItem.startTime > params.fromDate);
        }

        if (params.toDate) {
            schedule = schedule.filter(scheduleItem => scheduleItem.endTime < params.toDate);
        }

        return schedule;
    }
}
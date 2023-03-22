import {Inject, Service} from "typedi";
import {ScheduleFetchService} from "../services/schedule-fetch-service";
import {ScheduleParseService} from "../services/schedule-parse-service";
import {ScheduleFetchParams} from "../models/schedule-fetch-params";
import {ScheduleCacheS3} from "../infrastructure/s3/schedule-cache-s3";

@Service()
export class ScheduleController {
    @Inject()
    private scheduleFetchService: ScheduleFetchService;
    @Inject()
    private scheduleParseService: ScheduleParseService;
    @Inject()
    private scheduleCacheS3: ScheduleCacheS3;

    async getSchedule(params: ScheduleFetchParams) {
        const cachedSchedule = await this.scheduleCacheS3.getCachedSchedule(params.id);
        let schedule;

        if (cachedSchedule) {
            console.log('Using cached schedule');
            schedule = this.scheduleParseService.parseIcsToJson(cachedSchedule);
        } else {
            console.log('Fetching new schedule');
            const fetchedSchedule = await this.scheduleFetchService
                .fetchIcsFile(params.id, params.type);

            schedule = this.scheduleParseService.parseIcsToJson(fetchedSchedule);

            await this.scheduleCacheS3.createCachedSchedule(params.id, fetchedSchedule);
        }

        if (params.fromDate) {
            schedule = schedule.filter(scheduleItem => scheduleItem.startTime > params.fromDate);
        }

        if (params.toDate) {
            schedule = schedule.filter(scheduleItem => scheduleItem.endTime < params.toDate);
        }

        return schedule;
    }
}
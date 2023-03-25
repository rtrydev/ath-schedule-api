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
        const weekOffset = 2172;
        const cachedSchedule = await this.scheduleCacheS3.getCachedSchedule(params.id);
        let schedule;

        const currentDate = new Date();

        const first = currentDate.getDate() - currentDate.getDay() + 1;
        const firstDay = new Date(currentDate.setDate(first));
        const firstDayTimeReset = new Date(firstDay.setHours(3));

        const weekStartTimestamp = Math.floor(firstDayTimeReset.getTime() / 1000);
        const weekEndTimestamp = weekStartTimestamp + 60 * 60 * 24 * 7;

        const fetchParams = {
            id: params.id,
            type: params.type,
            fromDate: params.fromDate || weekStartTimestamp,
            toDate: params.toDate || weekEndTimestamp
        }

        if (cachedSchedule) {
            console.log('Using cached schedule');
            schedule = this.scheduleParseService.parseIcsToJson(cachedSchedule);
        } else {
            console.log('Fetching new schedule');
            const week = Math.floor(params.fromDate / 60 / 60 / 24 / 7) - weekOffset;

            const fetchedSchedule = await this.scheduleFetchService
                .fetchIcsFile(params.id, params.type, week);

            schedule = this.scheduleParseService.parseIcsToJson(fetchedSchedule);

            if (schedule.length > 0) {
                await this.scheduleCacheS3.createCachedSchedule(params.id, fetchedSchedule);
            }
        }

        if (fetchParams.fromDate) {
            schedule = schedule.filter(scheduleItem => scheduleItem.startTime > fetchParams.fromDate);
        }

        if (fetchParams.toDate) {
            schedule = schedule.filter(scheduleItem => scheduleItem.endTime < fetchParams.toDate);
        }

        return schedule;
    }
}
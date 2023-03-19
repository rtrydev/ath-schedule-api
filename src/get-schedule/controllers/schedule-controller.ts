import {Inject, Service} from "typedi";
import {ScheduleFetchService} from "../services/schedule-fetch-service";
import {ScheduleParseService} from "../services/schedule-parse-service";

@Service()
export class ScheduleController {
    @Inject()
    private scheduleFetchService: ScheduleFetchService;

    @Inject()
    private scheduleParseService: ScheduleParseService;

    async getSchedule(id: string, type: string) {
        await this.scheduleFetchService.fetchIcsFile(id, type);

        return this.scheduleParseService.parseIcsToJson(`/tmp/${id}.ics`);
    }
}
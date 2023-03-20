import 'reflect-metadata';
import {Container} from "typedi";
import {ScheduleController} from "./controllers/schedule-controller";
import {ScheduleFetchParams} from "./models/schedule-fetch-params";

export const getSchedule = async (event: any) => {
    const scheduleParams: ScheduleFetchParams = {
        id: event.queryStringParameters?.id,
        type: event.queryStringParameters?.type,
        fromDate: parseInt(event.queryStringParameters?.fromDate),
        toDate: parseInt(event.queryStringParameters?.toDate)
    };

    if (!scheduleParams.id || !scheduleParams.type) {
        return {
            statusCode: 400
        };
    }

    const scheduleController = Container.get(ScheduleController);

    const schedule = await scheduleController.getSchedule(scheduleParams);

    return {
        statusCode: 200,
        body: JSON.stringify({
            schedule
        }),
        headers: {
            'content-type': 'application/json'
        }
    };
}
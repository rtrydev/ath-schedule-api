import 'reflect-metadata';
import {Container} from "typedi";
import {ScheduleController} from "./controllers/schedule-controller";

export const getSchedule = async (event: any) => {
    const scheduleParams = {
        id: event.queryStringParameters?.id,
        type: event.queryStringParameters?.type,
    }

    if (!scheduleParams.id || !scheduleParams.type) {
        return {
            statusCode: 400
        };
    }

    const scheduleController = Container.get(ScheduleController);

    const schedule = await scheduleController.getSchedule(scheduleParams.id, scheduleParams.type);

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
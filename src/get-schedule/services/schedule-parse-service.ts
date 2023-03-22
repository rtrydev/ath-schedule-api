import * as fs from "fs";
import {Service} from "typedi";
import {ScheduleDetails} from "../models/schedule-details";

@Service()
export class ScheduleParseService {
    public parseIcsToJson(icsSchedule: string): ScheduleDetails[] {
        const rawEvents: any[] = [];
        let currentRawObj: any = {};

        const lines = icsSchedule.split('\n')

        lines.forEach(line => {
            if (line === 'BEGIN:VEVENT') {
                currentRawObj = {};
                return;
            }

            if (line === 'END:VEVENT') {
                rawEvents.push({...currentRawObj});
                return;
            }

            const [key, value] = line.split(':');

            currentRawObj[key] = value;
        });

        return rawEvents.map(
            event => {
                const summary = event.SUMMARY.toString();
                const summaryItems = summary.split(' ') as string[];

                return {
                    id: event.UID.toString(),
                    startTime: Date.parse(this.formatDate(event.DTSTART.toString())) / 1000,
                    endTime: Date.parse(this.formatDate(event.DTEND.toString())) / 1000,
                    course: summaryItems[0],
                    type: summaryItems[1],
                    speakers: summaryItems.slice(2, summaryItems.length - 1),
                    room: summaryItems.slice(-1)[0]
                };
            }
        );
    }

    private formatDate(datetime: string) {
        const [date, time] = datetime.split('T');

        const year = date.slice(0, 4);
        const month = date.slice(4, 6);
        const day = date.slice(6, 8);

        const hour = time.slice(0, 2);
        const minute = time.slice(2, 4);
        const second = time.slice(4, 6);

        return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
    }
}

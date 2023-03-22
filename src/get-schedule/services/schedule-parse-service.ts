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

                const speakers = this.getSpeakers(summary);
                const rooms = this.getRooms(summary);

                let strippedSummary: string = summary;

                speakers.forEach(speaker => {
                    strippedSummary = strippedSummary.replace(speaker, '');
                });

                rooms.forEach(room => {
                    strippedSummary = strippedSummary.replace(room, '');
                });

                strippedSummary = strippedSummary.replace(/ +/g, ' ').trim();
                const summaryItems = strippedSummary.split(' ') as string[];

                return {
                    id: event.UID.toString(),
                    startTime: Date.parse(this.formatDate(event.DTSTART.toString())) / 1000,
                    endTime: Date.parse(this.formatDate(event.DTEND.toString())) / 1000,
                    course: summaryItems.slice(0, -1).join(' '),
                    type: summaryItems[summaryItems.length - 1],
                    speakers: this.getSpeakers(summary),
                    rooms: this.getRooms(summary)
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

    private getRooms(summary: string) {
        const roomRegex = /([A-Z][0-9]{1,3}[A-Za-z]?)|(Hala sportowa [0-9]\/[0-9])|(nauczanie zdalne)/g;

        const regexMatch = summary.matchAll(roomRegex);

        return Array.from(regexMatch, match => match[0]);
    }

    private getSpeakers(summary: string) {
        const speakerRegex = /[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]?[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{1,2}/g;

        const regexMatch = summary.matchAll(speakerRegex);

        return Array.from(regexMatch, match => match[0]);
    }
}

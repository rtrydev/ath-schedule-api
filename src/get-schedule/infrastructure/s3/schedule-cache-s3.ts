import {S3} from "aws-sdk";
import {Service} from "typedi";

@Service()
export class ScheduleCacheS3 {
    private s3: S3;

    constructor() {
        this.s3 = new S3();
    }

    async getCachedSchedule(id: string) {
        let cachedSchedule = null;

        try {
            const fetchedSchedule = await this.s3.getObject({
                Bucket: this.getS3Bucket(),
                Key: this.getCacheKey(id)
            }).promise();

            if (!fetchedSchedule.Body) {
                return;
            }

            const maxCacheTime = 1000 * 60 * 60 * 24;

            const timeNow = new Date().getTime();
            const lastModifiedTime = fetchedSchedule?.LastModified?.getTime() || timeNow;

            const isExpired = (timeNow - lastModifiedTime) > maxCacheTime;

            return isExpired ? null : fetchedSchedule.Body?.toString();
        } catch (e) {
            console.log(`Could not find cached version for ${id}, fetching data from server`);
        }

        return cachedSchedule;
    }

    async createCachedSchedule(id: string, schedule: string) {
        let result = false;

        await this.s3.putObject({
            Bucket: this.getS3Bucket(),
            Key: this.getCacheKey(id),
            Body: schedule
        }, (err, data) => {
            if (err) {
                console.log(`Failed to create cache for ${id}`, err.message);
                return;
            }

            if (data) {
                console.log(`Created cache for ${id}`);
                result = true;
            }
        }).promise();

        return Promise.resolve(result);
    }

    private getS3Bucket() {
        return 'ath-schedule-cache';
    }

    private getCacheKey(id: string) {
        return `${id}.ics`;
    }
}
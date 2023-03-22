import {Service} from "typedi";
import * as fs from "fs";
import axios from "axios";

@Service()
export class ScheduleFetchService {
    async fetchIcsFile(id: string, type: string) {
        const url = `https://plany.ath.bielsko.pl/plan.php?type=${type}&id=${id}&cvsfile=true`;

        const response = await axios.get(url);
        return response.data;
    }
}
import {Service} from "typedi";
import {DynamoDB} from "aws-sdk";
import {ScheduleBranchData} from "./models/schedule-branch-data";

@Service()
export class ScheduleBranchesDynamodb {
    private dynamodb: DynamoDB;

    constructor() {
        this.dynamodb = new DynamoDB();
    }

    async addItem(scheduleBranchData: ScheduleBranchData) {
        await this.dynamodb.putItem({
            TableName: this.getDynamoTable(),
            Item: {
                'branch_id': {
                    'S': scheduleBranchData.branchId
                },
                'ttl': {
                    'N': scheduleBranchData.ttl.toString()
                },
                'branch_data': {
                    'S': JSON.stringify(scheduleBranchData.branchData)
                }
            }
        }, (err, data) => {
            if (err) {
                return;
            }

            if (data) {
                console.log('Successfully added branch data');
            }
        }).promise();
    }

    async getItem(branchId: string) {
        let result: any = null;

        try {
            await this.dynamodb.getItem({
                TableName: this.getDynamoTable(),
                Key: {
                    'branch_id': {
                        'S': branchId
                    }
                }
            }, (err, data) => {
                if (err) {
                    return;
                }

                if (data && data.Item) {
                    result = {
                        branchId: data.Item?.branch_id.S || '',
                        ttl: parseInt(data.Item?.ttl.N || '0'),
                        branchData: JSON.parse(data.Item?.branch_data.S || '{}')
                    }
                }
            }).promise();
        } catch (e) {
            result = null;
        }

        return result;
    }

    private getDynamoTable() {
        return 'ath-schedule-branches';
    }
}
import { BackendService } from '../../../../../services/backend-service/backend-service';
import { ResultsTableInterface } from '../../../../../interfaces/results-table.interface';
import { NewsOfflineResultsInterface } from '../../../../../services/news-service/interfaces/news-offline-results.interface';
import { Injectable } from '@angular/core';
import { DfwcResultsDtoInterface } from '../dto/dfwc-results.dto';
import { DfwcSingleResultDtoInterface } from '../dto/dfwc-single-result.dto';
import { Html5Entities } from 'html-entities';

@Injectable({
    providedIn: 'root',
})
export class DfwcResultsService {
    public mapDfwcResultsToOfflineNews(news: NewsOfflineResultsInterface): NewsOfflineResultsInterface {
        const { vq3, cpm }: DfwcResultsDtoInterface = JSON.parse(news.tableJson);

        return {
            ...news,
            cpmResults: this.getPhysicsResults(cpm),
            vq3Results: this.getPhysicsResults(vq3),
        };
    }

    private getPhysicsResults(results: Record<string, DfwcSingleResultDtoInterface>): ResultsTableInterface {
        const arrayResults: DfwcSingleResultDtoInterface[] = Object.values(results);
        const firstPlaceTime = +arrayResults[0].time_ms;
        const entities = new Html5Entities();

        let currentPlace = 0; // used for detecting ties

        return {
            valid: arrayResults.map((result: DfwcSingleResultDtoInterface, index: number) => {
                if (index > 0 && arrayResults[index].time_ms !== arrayResults[index - 1].time_ms) {
                    currentPlace = index;
                }

                const k1 = firstPlaceTime / +result.time_ms;
                const k2 = (100 - currentPlace) / 100;
                const points = arrayResults[0].rank ? result.points : Math.round(1000 * k1 * k2).toString();
                const demopath = entities.decode(result.demo);

                return {
                    bonus: '0',
                    change: '0',
                    col: '',
                    country: result.flag,
                    demopath,
                    impressive: '0',
                    nick: result.name,
                    playerId: '',
                    rating: points,
                    row: '',
                    time: result.time.replace(/\:/, '.'),
                    isPreliminaryResult: !arrayResults[0].rank,
                    absoluteLink: true,
                };
            }),
            invalid: [],
        };
    }
}

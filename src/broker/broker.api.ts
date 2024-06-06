import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';
import { BehaviorSubject, firstValueFrom, of, switchMap } from 'rxjs';
import { TYPES } from '../inversify.types';
import { VertexSearchDto } from './dto/vertex-rest.dto';
import { GraphProjectServicesResponseDto } from './dto/graph-project-services-rest.dto';
import { Application } from '../services/app.service';

@injectable()
/**
 *
 */
export class BrokerApi {
  private axiosOptions!: AxiosRequestConfig;
  private projectServices$ = new BehaviorSubject<{
    timestamp: number;
    response: AxiosResponse<
      GraphProjectServicesResponseDto[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    > | null;
  }>({ timestamp: 0, response: null });

  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.BrokerApiUrl) private brokerApi: string,
    @inject(TYPES.BrokerToken) private brokerToken: string,
  ) {
    this.setToken();
  }

  public setToken() {
    this.axiosOptions = {
      baseURL: this.brokerApi,
      headers: {
        Authorization: `Bearer ${this.brokerToken}`,
      },
    };
  }

  public async searchVertices(
    collection: string,
    edgeName?: string,
    edgeTarget?: string,
  ): Promise<VertexSearchDto[]> {
    const response = await axios.post(
      `v1/graph/vertex/search?collection=${collection}` +
        (edgeName !== undefined && edgeTarget !== undefined
          ? `&edgeName=${edgeName}&edgeTarget=${edgeTarget}`
          : ''),
      {},
      this.axiosOptions,
    );
    return response.data;
  }

  public async getProjectServices(): Promise<
    GraphProjectServicesResponseDto[]
  > {
    const now = Date.now();
    return firstValueFrom(
      this.projectServices$.pipe(
        switchMap((cache) => {
          // Check if the cache is valid (i.e., less than 10 seconds old)
          if (cache.response && now - cache.timestamp < 10000) {
            // console.log('Project Services from cache');
            return of(cache.response.data); // Return cached data
          } else {
            // console.log('Fetching new Project Services');
            // Make a new request if cache is expired or doesn't exist
            return this.requestProjectServices().then((response) => {
              // Update the cache -- Will trigger cache check which should pass
              this.projectServices$.next({
                timestamp: Date.now(),
                response,
              });
              return response.data;
            });
          }
        }),
      ),
    );
  }

  public async getProjectServicesAsApps(): Promise<Application[]> {
    return this.getProjectServices().then((projects) => {
      const applicationArr: Application[] = [];
      for (const project of projects) {
        for (const service of project.services) {
          applicationArr.push({
            app: service.name,
            project: project.name,
            env: service.shortEnv,
            config: service.vaultConfig,
          });
        }
      }
      return applicationArr;
    });
  }

  private requestProjectServices() {
    return axios.get<GraphProjectServicesResponseDto[]>(
      'v1/graph/data/project-services',
      this.axiosOptions,
    );
  }
}

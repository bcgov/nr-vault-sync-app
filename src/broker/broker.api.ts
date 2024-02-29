import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';
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
  private projectServiceReq: Promise<
    AxiosResponse<
      GraphProjectServicesResponseDto[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >
  > | null = null;

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
    if (!this.projectServiceReq) {
      this.projectServiceReq = axios.get<GraphProjectServicesResponseDto[]>(
        'v1/graph/data/project-services',
        this.axiosOptions,
      );
    }
    return (await this.projectServiceReq).data;
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
          });
        }
      }
      return applicationArr;
    });
  }
}

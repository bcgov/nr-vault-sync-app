import axios, { AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify.types';
import { VertexSearchDto } from './dto/vertex-rest.dto';

@injectable()
/**
 *
 */
export class BrokerApi {
  private axiosOptions!: AxiosRequestConfig;

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
}

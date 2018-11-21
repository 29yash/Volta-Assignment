import AxiosService from "./AxiosService";
import URI from "../constants/uri"

export default class WebService extends AxiosService {

    static instance = null;

    constructor() {
        super();
    }

    /** Singleton Patter
    * @returns {WebService}
    */
    static getInstance() {
        if (WebService.instance == null) {
            WebService.instance = new WebService();
        }
        return this.instance;
    }

    /**
    * Get Stations Call - Get all station lists api call
    * Takes success and failure operations
    *
    * Optional params: searchTerms
    */
    getStations(searchTerms, success, failure) {
        var addition = "";
        Object.keys(searchTerms).map((key) => {
            addition += "&" + key + "=" + searchTerms[key];
        });
        this.getCall(URI.GET_ALL_STATIONS + "?" + addition, success, failure);
    }
}
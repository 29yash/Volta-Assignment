import axios from 'axios';
import URI from "../constants/uri";
class AxiosService {
    constructor() {}

    api = axios.create({
        baseURL: URI.BASE_URL,
        timeout: 10000,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });

    async postCall(path, details, success, failure) {
        try{
            const response = await this.api.post(path, details);
            success(this.handleResponse(response));
        }
        catch(err){
            console.error(err);    
            failure(this.handleError(err));            
        }
    }

    async getCall(path, success, failure) {
        try{
            
            const response = await this.api.get(path);
            success(this.handleResponse(response));
        }
        catch(err){
            console.error(err);    
            failure(this.handleError(err));            
        }
    }

    async deleteCall(path, details = null, success, failure) {
        try{
            const response = await this.api.delete(path, details);
            success(this.handleResponse(response));
        }
        catch(err){
            console.error(err);    
            failure(this.handleError(err));            
        }
    }

    handleResponse(response){   
        if(response.data){
            return response.data;
        }
        return response;
    }


    handleError(error){
        if(error.response){
            const errorMessage = (error.response.data && error.response.data.message) || error.message;
            return errorMessage;   
        }    
        return error.message;
    }
}
export default AxiosService;

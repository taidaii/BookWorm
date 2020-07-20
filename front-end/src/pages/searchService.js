import axios from 'axios';
const API_URL = 'http://localhost:8000';

export default class searchService{
	constructor(){}
	getSearch(query){
		console.log("the query is");
		console.log(query);
		const url = `${API_URL}/api/customers/search/`;
		var json =  axios.post(url,query).then(response => response.data);
		console.log("the json is");
		console.log(json);
		return json;
	}
}
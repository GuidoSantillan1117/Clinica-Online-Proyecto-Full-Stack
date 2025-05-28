import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrlGithub = "https://api.github.com/users/GuidoSantillan1117";
  private apiUrlTrivia = "https://opentdb.com/api.php?amount=40&category=21&difficulty=easy&type=multiple"

  constructor(private http:HttpClient) { 

  }

  obtenerDatosGithub ():Observable<any>{
    return this.http.get(this.apiUrlGithub);
  }

  obtenerDatosTrivia(): Observable<any>{
    return this.http.get(this.apiUrlTrivia)
  }
}

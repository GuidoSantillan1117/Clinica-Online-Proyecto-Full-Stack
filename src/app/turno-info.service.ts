import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnoInfoService {

    private elegirTurnoAbiertoSubject = new BehaviorSubject<boolean>(false); 
    elegirTurnoAbierto$ = this.elegirTurnoAbiertoSubject.asObservable(); 


  constructor() { 

  }

  abrirTurno()
  {
    this.elegirTurnoAbiertoSubject.next(true)
  }

  cerrarTurno()
  {
    this.elegirTurnoAbiertoSubject.next(false)
  }
}

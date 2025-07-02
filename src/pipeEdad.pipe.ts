import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeEdad'
})
export class PipeEdadPipe implements PipeTransform {

  transform(value: any, edad: number): any {
    const edadNumber = Number(edad);
    if (edadNumber < 13) {
      return `${value} (Menor)`;
    } else if (edadNumber < 20) {
      return `${value} (Adolescente)`;
    } else if (edadNumber < 60) {
      return `${value} (Adulto)`;
    } else {
      return `${value} (Mayor)`;
    }
  }

}

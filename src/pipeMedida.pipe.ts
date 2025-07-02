import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeMedida'
})
export class PipeMedidaPipe implements PipeTransform {

  transform(value: any, tipo:string): any {
    switch(tipo)
    {
      case 'peso':
        return `${value} kg`;
      case 'temperatura':
        return `${value} °C`;
      case 'presion':
        return `${value} mmHg`;
      case 'altura':
        const alturaString = value.toString();
        const conPunto = alturaString.slice(0, 1) + '.' + alturaString.slice(1);
        return `${conPunto} m`;

    }
    return null;
  }

}

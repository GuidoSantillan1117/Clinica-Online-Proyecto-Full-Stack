export class Especialidad{
    valor: string ;
    inicio:string | undefined ; 
    final:string | undefined ;
    horarioSinAsignar = false;
    dia:string = "";
    coincide:boolean = false;

    
    
    constructor(valor:string,inicio?:string,final?:string,dia?:string)
    {
        
        this.valor = valor;
        if(final)
        {
            this.final = final;
        }
        if(inicio)
        {
            this.inicio = inicio;
        }

        if(dia)
        {
            this.dia = dia
        }
    }

    horarioSinAsignarSet(valor:boolean)
    {
        this.horarioSinAsignar = valor
    }

    coincidenSet(valor:boolean)
    {
        this.coincide = valor
    }
    

}
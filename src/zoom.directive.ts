import { Directive,ElementRef,HostListener ,inject} from '@angular/core';

@Directive({
  selector: '[appZoom]'
})
export class ZoomDirective {
  element: ElementRef<HTMLElement> = inject(ElementRef);

  @HostListener('mouseenter') onMouseEnter() {
    this.element.nativeElement.style.transform = 'scale(1.1)';
    this.element.nativeElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 10)';
    this.element.nativeElement.style.border = '2px solid rgb(181, 197, 212)'
    this.element.nativeElement.style.transition = 'transform 0.3s ease';
    this.element.nativeElement.style.marginTop = '100px';
    this.element.nativeElement.style.marginBottom = '100px';
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.element.nativeElement.style.transform = 'scale(1)';
    this.element.nativeElement.style.border = 'none';
    this.element.nativeElement.style.boxShadow = 'none';
    this.element.nativeElement.style.transition = 'transform 0.3s ease';
        this.element.nativeElement.style.marginTop = 'auto';
    this.element.nativeElement.style.marginBottom = 'auto';
  }
  constructor() { }

}

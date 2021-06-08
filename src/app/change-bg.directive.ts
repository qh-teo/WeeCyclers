import {NgModule, ElementRef, Directive } from '@angular/core';

@Directive({
  selector: '[appChangeBG]'
})
export class ChangeBGDirective {

  constructor(el: ElementRef) { 

  }

}

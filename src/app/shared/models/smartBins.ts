export class SmartBin {
  id: string;
  name: string;
  slatlng: string
  constructor(name:string,id: string, slatlng: string) {
    this.name = name;
    this.id = id;
    this.slatlng = slatlng;
  }
 }
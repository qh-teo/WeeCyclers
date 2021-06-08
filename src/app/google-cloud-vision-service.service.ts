import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleCloudVisionServiceService {
  constructor(public http: HttpClient) { }
  getLabels(base64Image) {
    const body = {
      "requests": [
        {
          "features": [
            {
              "type": 'LABEL_DETECTION'
            }
          ],
          "image": {
            "content": base64Image
          }
        }
      ]
    }
    return this.http.post('https://vision.googleapis.com/v1/images:annotate?key=' + environment.googleCloudVisionAPIKey, body);
  }
}

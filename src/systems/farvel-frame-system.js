export class FarvelFrameSys {
  constructor(scene) {
    this.scene = scene;
  }

  tick(time) {
    //detect all media-images with abnormal children
    let mediaImages = Array.from(document.querySelectorAll("[media-image]"));
    mediaImages.forEach(el => {
      el.childNodes;
    });
  }
}

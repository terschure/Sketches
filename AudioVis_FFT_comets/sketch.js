/* Comet shower
by austinzhangmusic */
// edited by Anneke

let mic, fft;
var sensitivity, sens;
let dist = 20; // set padding
let inc = 0.01; // size of change of the angle of movement
let scl = 10; // smoothness?
let rows;
let cols;
let field;
let zoff = 0;
let particleNum = 256;
let particles = [];
var volHistory = [];
let color = 220;

function setup() {
  createCanvas(600, 750);
  rows = width / scl;
  cols = height / scl;
  field = new Array(rows * cols);
  mic = new p5.AudioIn;
  mic.start();

  for (let i = 0; i < particleNum; i++) {
      particles[i] = new Particle(random(0,width), random(0,height));
  }

  fft = new p5.FFT();
  fft.setInput(mic);
  background(0);
}

function draw() {
  background(0, 8);
  let xoff = 0;
  let yoff = 0;
  sensitivity = document.querySelector('#sensitivity').value;
  sens = map(sensitivity, 0, 1, 1, 0);

  strokeWeight(1);
  stroke(color);

  // for (let y = 0; y < rows; y++) {
  //     xoff = 0;
  //     for (let x = 0; x < cols; x++) {
  //       let index = x + y * cols;
  //       let angle = noise(xoff, yoff, zoff) * TWO_PI;
  //       field[index] = p5.Vector.fromAngle(angle);
  //       field[index].setMag(2);
  //       /*
  //       push();
  //       translate(x * scl, y * scl);
  //       rotate(field[index].heading());
  //       line(0, 0, scl, 0);
  //       pop(); */
  //       xoff += inc;
  //     }
  //     yoff += inc;
  //     zoff += 0.0001;
  //   }
  

  for (let x = 0; x < cols; x++) {
    xoff = 0;
    for (let y = 0; y < rows; y++) {
      let index = x * rows + y;
      let angle = noise(xoff, yoff, zoff) * -PI; // was: *TWO_PI (particles moving left)
      field[index] = p5.Vector.fromAngle(angle);
      //field[index].setMag(2);

      // push();
      // translate(x * scl, y * scl);
      // rotate(field[index].heading());
      // line(0, 0, scl, 0);
      // pop(); 
      yoff += inc;
    }
    xoff += inc;
    zoff += 0.0001;
  }

  let spectrum = fft.analyze();

  // draw the line
  push();
  translate(width/2,0);
  stroke(color);
  noFill();
  beginShape();
  for (i = 0; i < spectrum.length; i++) {
    //vertex()
    //vertex(i, map(spectrum[i], 0, 255, height, 0));
    vertex(i, map(spectrum[i], 0, height*sens*4, height, 0));
    if(spectrum[i] > 100){
      particles[i] = new Particle(random(0,width), random(0,height));
    }
  }
  endShape();
  pop();

  push();
  scale(-1, 1, 1);
  translate(-width/2,0);
  stroke(color);
  noFill();
  beginShape();
  for (i = 0; i < spectrum.length; i++) {
    //vertex()
    //vertex(i, map(spectrum[i], 0, 255, height, 0));
    vertex(i, map(spectrum[i], 0, height*sens*4, height, 0));
  }
  endShape();
  pop();


  for (let i = 0; i < particleNum; i++) { //for (let i = 0; i < particleNum; i++) {
    particles[i].follow(field, scl, rows); // 
    let windSpeed = map(spectrum[i]/100, 0, sens, 0.1, 1.6); // dit was: map(mic.getLevel(0.5), 0, sens, 0.1, 8);
    particles[i].update(windSpeed);
    particles[i].show();
  }
}


class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.prev = this.pos.copy();
  }
  
  show() {
    strokeWeight(2);
    stroke(color);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
  }
  
  update(maxSpeed) {
    // if (this.pos.x > width) {
    //     this.pos.x = 0;
    // }
    // if (this.pos.x < 0) {
    //     this.pos.x = width;
    // }
    // if (this.pos.y > height) {
    //     this.pos.y = 0;
    // }
    // if (this.pos.y < 0) {
    //     this.pos.y = height;
    // }
    this.prev = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(maxSpeed);
    //console.log(this.vel)
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }
  
  follow(flowfield, scl, rows) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y; // let index = x + y * cols;
    let force = flowfield[index];
    this.applyForce(force);
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
}
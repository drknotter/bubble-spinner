var canvas;
var context;
var w, h;
var m_x, m_y;
var int_id, paused=0;
var DT = 0.25;

var shot_list = new Array();
var mesh_list = new Array();
var in_shooter, on_deck;
var exchange_timer = 0;

var shooter_angle = 0;
var shooter_height = 75;
var shooter_radius = 30;

function init() {

    canvas = document.getElementById("canvas");

    if( canvas.getContext ) {

        context = canvas.getContext("2d");
        context.font = "20px";
        canvas.style.cursor = "crosshair";
        
        w = canvas.width;
        h = canvas.height;

        in_shooter = new Bubble(w/2,shooter_height,13,0,0,255);
        on_deck = new Bubble(w/2,shooter_height-20,7,0,0,255);

        init_mesh();
        
        int_id = setInterval(draw,DT*100);
        
    }
}

function init_mesh() {
    
    mesh_list[0] = new Bubble(w/2,h/2,13,0,0,225);
    mesh_list[1] = new Bubble(w/2+30,h/2,13,0,0,225);
    mesh_list[2] = new Bubble(w/2-30,h/2,13,255,0,0);

    mesh_list[0].neighbors[0] = 1;
    mesh_list[0].neighbors[1] = 2;
    mesh_list[1].neighbors[0] = 0;
    mesh_list[2].neighbors[0] = 0;
    
}

function Bubble(x_init,
                y_init,
                r_init,
                red_init,
                green_init,
                blue_init) {

    this.x = x_init;
    this.y = y_init;
    this.r = r_init;
    this.theta = Math.PI/4;
    this.red = red_init;
    this.green = green_init;
    this.blue = blue_init;
    this.alpha = 1;

    this.v_x = 0;
    this.v_y = 0;
    this.collisions = 9;
    this.kill_timer = 20;
    this.dead = 0;

    this.neighbors = new Array();

    this.draw = function() {
        
        context.save();

        context.translate(this.x,this.y);
        context.rotate(-this.theta);

        var gradient = context.createRadialGradient(this.r/2,0,0,this.r/2,0,this.r*2);	
        gradient.addColorStop(0,"rgba(255,255,255,"+this.alpha+")");
        gradient.addColorStop(0.55,"rgba("+this.red+","
                            	            +this.green+","
                                          +this.blue+","
                            	            +this.alpha+")");
        gradient.addColorStop(1,"rgba(0,0,0,"+this.alpha+")");


        context.beginPath();
        context.arc(0,0,this.r,0,2*Math.PI,true);
        context.closePath();

        context.fillStyle = gradient;
        context.fill();

        context.restore();

    }

    this.update = function() {

        if( this.collisions > 0 ) {
            
            this.x += this.v_x*DT;
            this.y += this.v_y*DT;
            
            if( this.x < this.r || this.x > w-this.r ) {
                this.v_x *= -1;
                if( this.x < this.r ) this.x = this.r;
                if( this.x > w-this.r ) this.x = w-this.r;
                this.collisions--;
            } else if( this.y < shooter_height || this.y > h-this.r ) {
                this.v_y *= -1;
                if( this.y < this.r ) this.y = shooter_height
                if( this.y > h-this.r ) this.y = h-this.r;
                this.collisions--;
            }

            if( this.collisions == 0 ) {
                this.v_x *= 0.25;
                this.v_y = -50;
            }

        } else {
            
            this.v_y += 9.8*DT*5;

            this.x += this.v_x*DT;
            this.y += this.v_y*DT;

            this.r += 1;
            this.alpha -= 0.05;
            if( this.alpha < 0 ) this.alpha = 0;
            this.kill_timer--;

        }

    }

}

function draw() {
    
    erase();

    context.fillText("x: "+m_x+" y: "+m_y+" angle: "+shooter_angle,5,h-5);

    context.save();

    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(0,shooter_height);
    context.arc(w/2,shooter_height,shooter_radius,Math.PI,0,false);
    context.lineTo(w,shooter_height);
    context.lineTo(w,0);
    context.closePath();

    context.fillStyle = "rgb(192,192,192)";
    context.fill();

    context.restore();

    context.save();
    
    context.translate(w/2,shooter_height);
    context.rotate(Math.PI/2-shooter_angle);
    
    context.beginPath();
    context.moveTo(0,0);
    context.lineTo(40,0);
    context.lineTo(25,-5);
    context.lineTo(25,5);
    context.lineTo(40,0);
    context.closePath();
    
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    context.fill();

    context.restore();

    if( exchange_timer > 0 ) {
        
        in_shooter.y += 20/(DT*100);
        in_shooter.r += 6/(DT*100);

        exchange_timer--;
    }

    on_deck.draw();
    in_shooter.draw();
    
    for( var i=0; i<shot_list.length; i++ ) {
        if( shot_list[i].kill_timer < 0 ) {
            for( var j=i--; j<shot_list.length-1; j++ )
                shot_list[j] = shot_list[j+1];
            shot_list.length--;
            continue;
        }
        shot_list[i].update();
        shot_list[i].draw();
    }
    for( var i=0; i<mesh_list.length; i++ ) {
        if( mesh_list[i].kill_timer < 0 ) {
            for( var j=i--; j<mesh_list.length-1; j++ )
                mesh_list[j] = mesh_list[j+1];
            mesh_list.length--;
            continue;
        }
        mesh_list[i].update();
        mesh_list[i].draw();
    }

}

function erase() {
    
    context.clearRect(0,0,w,h);
    
}

function mouse_move(event) {

    m_x = event.clientX-canvas.offsetLeft;
    m_y = event.clientY-canvas.offsetTop;

    shooter_angle = -Math.atan2(w/2-m_x,m_y-shooter_height);
    if( shooter_angle > Math.PI/2 ) shooter_angle = Math.PI/2;
    if( shooter_angle < -Math.PI/2 ) shooter_angle = -Math.PI/2;

}

function mouse_down(event) {

}

function mouse_click(event) {

}

function mouse_up(event) {
    
    if( exchange_timer == 0 ) {

        shot_list[shot_list.length] = in_shooter;
        shot_list[shot_list.length-1].v_x = 100*Math.cos(shooter_angle-Math.PI/2);
        shot_list[shot_list.length-1].v_y = -100*Math.sin(shooter_angle-Math.PI/2);
        
        in_shooter = on_deck;
        on_deck = new Bubble(w/2,shooter_height-20,7,0,0,255);
        
        exchange_timer = DT*100;
        
    }
    
}

function key_press(event) {

    var code = event.keyCode?event.keyCode:event.which;

    switch( code ) {
    case 112:
        if( paused == 0 ) {
            clearInterval(int_id);
            paused = 1;
        }	else {
            int_id = setInterval(draw,DT*100);
            paused = 0;
        }
        break;
    }
    
}

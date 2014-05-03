$(document).ready(function() {
    //Set up canvas
    var scale = 10;
    var scalestep = 0.25;

    var canvelm = document.getElementById('rocketview');
    var ctx = canvelm.getContext("2d");
    ctx.canvas.width = canvelm.clientWidth;
    ctx.canvas.height = canvelm.clientHeight;
    ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2);
    ctx.scale(scale,-scale);
    ctx.lineWidth = 0.1;

    CanvasRenderingContext2D.prototype.drawX = function(x,y,hairsize) {
        this.beginPath()
        this.moveTo(x-hairsize,y-hairsize);
        this.lineTo(x+hairsize,y+hairsize);
        this.moveTo(x-hairsize,y+hairsize);
        this.lineTo(x+hairsize,y-hairsize);
        this.stroke();
    }

    rocket = new Rocket(rocketdata, ctx);
    rocket.draw();
    rocket.draw_centroid();

    slidermax = 10000;
    $('#fuelslider').slider({
        min: 0,
        max: slidermax,
        value: slidermax,
        slide: function(evt, ui) {
            curidx = $(this).data('cur_engine');
            if(curidx == undefined) { curidx = 0; }
            rocket.set_fuel(curidx, ui.value/slidermax);
            rocket.set_selected(curidx);

            render();
        }
    });

    $(canvelm).on('click',function(evt) {
        idx = rocket.getClosestPart(evt, 10);
        rocket.set_selected(idx);
        
        render();

        $('#fuelslider')
            .slider('value',rocket.get_fuel(idx)*slidermax)
            .data('cur_engine',idx);
    });

    $(canvelm).on('drag',function(evt, dragdrop) {
        ctx.translate(
            (dragdrop.deltaX - dragdrop.lastX)/scale,
            -(dragdrop.deltaY - dragdrop.lastY)/scale
        );
        dragdrop.lastX = dragdrop.deltaX;
        dragdrop.lastY = dragdrop.deltaY;
        render();
    });

    $(canvelm).on('mousewheel',function(evt) {
        canvaspoint = [
            (evt.pageX - this.offsetLeft)/scale,
            (evt.pageY - this.offsetTop)/scale
        ];
        console.log(canvaspoint);
        zoom(scalestep*evt.deltaY, canvaspoint);
        evt.preventDefault();
    });

    $('#load_button').click(function() {
        var endnums = /\d+$/;
        var shipurl = $('#load_rocket').val()
        var rocket_id = endnums.exec(shipurl);
        window.location.href = '/evaluate/' + rocket_id[0];
    });

    $('.closebtn').on('click',function(evt) {
        evt.preventDefault();
        evt.stopPropagation(); 
        $(this).parent().toggleClass('closed');
    })

    $('#zoom').on('click','button',function() {
        switch(this.value) {
            case '+':
                curscale = scalestep;
                break;
            case '-':
                curscale = -scalestep;
                break;
            case 'reset':
                curscale = 0;
                resetview();
                break;
        }
        zoom(curscale);
    });

    function zoom(relpct, relpoint) {
        //if(relpoint) { ctx.translate(-relpoint[0]*relpct,-relpoint[1]*relpct); }
        ctx.scale(1+relpct,1+relpct);
        scale += scale*relpct;
        render();
    }

    function resetview() {
        scale = 10;
        ctx.setTransform(1,0,0,1,0,0);
        ctx.translate(ctx.canvas.width/2,ctx.canvas.height/2);
        ctx.scale(scale,-scale);
        render();
    }

    function render() {
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0)
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.restore();

        rocket.draw();
        rocket.draw_centroid();
    }
});

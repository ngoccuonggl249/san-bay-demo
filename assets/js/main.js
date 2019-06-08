window.onload = () => {
    var beforePan = function (oldPan, newPan) {
        var sizes = this.getSizes(),
            leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) / 2,
            rightLimit = sizes.width / 2 - (sizes.viewBox.x * sizes.realZoom),
            topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) / 2,
            bottomLimit = sizes.height / 2 - (sizes.viewBox.y * sizes.realZoom);

        var customPan = {};
        customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
        customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

        return customPan
    };

    var setScale = (el, newZoom) => {
        let $el = $(el);
        let scale = 1 / newZoom;
        let circle = $(el).find('circle');
        let x = parseInt(circle.attr('cx'));
        let y = parseInt(circle.attr('cy'));
        let r = parseInt(circle.attr('r'));
        let transX = x + r;
        let transY = y + r;

        $el.attr('transform', `translate(${transX} ${transY}) scale(${scale} ${scale}) translate(-${transX} -${transY})`);
    };

    var beforeZoom = function (oldZoom, newZoom) {
        $('#Layer_1 .st24').parent().parent().map((i, el) => {
            setScale(el, newZoom)
        })
    };

    var eventsHandler = {
        haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
        , init: function (options) {
            var instance = options.instance
                , initialScale = 1
                , pannedX = 0
                , pannedY = 0;

            // Init Hammer
            // Listen only for pointer and touch events
            this.hammer = Hammer(options.svgElement, {
                inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
            });

            // Enable pinch
            this.hammer.get('pinch').set({enable: true});

            // Handle double tap
            this.hammer.on('doubletap', function (ev) {
                instance.zoomIn()
            });

            // Handle pan
            this.hammer.on('panstart panmove', function (ev) {
                // On pan start reset panned variables
                if (ev.type === 'panstart') {
                    pannedX = 0;
                    pannedY = 0
                }

                // Pan only the difference
                instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY});
                pannedX = ev.deltaX;
                pannedY = ev.deltaY
            });

            // Handle pinch
            this.hammer.on('pinchstart pinchmove', function (ev) {
                // On pinch start remember initial zoom
                if (ev.type === 'pinchstart') {
                    initialScale = instance.getZoom();
                    instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
                }

                instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
            });

            // Prevent moving the page on some devices when panning over SVG
            options.svgElement.addEventListener('touchmove', function (e) {
                e.preventDefault();
            });
        }

        , destroy: function () {
            this.hammer.destroy()
        }
    };

    svgPanZoom(document.querySelector('#Layer_1'), {
        zoomEnabled: true,
        controlIconsEnabled: false,
        zoomScaleSensitivity: 0.4,
        minZoom: 0.9,
        fit: 1,
        center: 1,
        beforePan: beforePan,
        beforeZoom: beforeZoom,
        customEventsHandler: eventsHandler
    });

    $('.st0').click(() => {
        $('#preBookingModal').modal('show');
    });
    $('.st24').click(() => {
        $('#preBookingModal').modal('show');
    })
};

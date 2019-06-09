window.onload = () => {
    var beforePan = function (oldPan, newPan) {
        var sizes = this.getSizes();

        var svgWidth = sizes.viewBox.width * sizes.realZoom;
        var svgHeight = sizes.viewBox.height * sizes.realZoom;

        var leftLimit;
        var rightLimit;
        var topLimit;
        var bottomLimit;

        if (svgWidth < sizes.width) {
            leftLimit = 0;
            rightLimit = sizes.width - svgWidth;
        } else {
            leftLimit = sizes.width - svgWidth;
            rightLimit = 0;
        }

        if (svgHeight < sizes.height) {
            topLimit = 0;
            bottomLimit = sizes.height - svgHeight;
        } else {
            topLimit = sizes.height - svgHeight;
            bottomLimit = 0;
        }

        var customPan = {};
        customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
        customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));

        return customPan
    };

    var setScale = function ($el, newZoom) {
        $el.map(function (i, el) {
            if (el.getBBox) {
                let bBox = el.getBBox();
                let $el = $(el);
                let scale = Math.min(devicePixelRatio, 2) / newZoom; //Fix icon size in mobile
                let x = bBox.x;
                let y = bBox.y;
                let r = bBox.width/2;
                let transX = x + r;
                let transY = y + r;

                if (isNaN(transX)) {
                    debugger
                }
                $el.attr('transform', `translate(${transX} ${transY}) scale(${scale} ${scale}) translate(-${transX} -${transY})`);
            }
        })
    };

    var beforeZoom = function (oldZoom, newZoom) {
        setScale($('#Layer_1 .st24').parent().parent(), newZoom);
        setScale($('.marker'), newZoom);
    };

    // Set icon size when init
    setScale($('#Layer_1 .st24').parent().parent(), 1);
    setScale($('.marker'), 1);

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

    $('.marker').click(() => {
        $('#preBookingModal').modal('show');
    });
};

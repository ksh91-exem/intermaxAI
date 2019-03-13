var ChartFrame = (function () {
    return {
        createChart: function (type) {
            switch(type) {
                case 'line':
                    return new Line();
                    break;
                case 'bar':
                    return new Bar();
                    break;
                case 'area':
                    return new Area();
                    break;
                case 'doughnut':
                    return new Doughnut();
                    break;
                case 'pie3d':
                    return new Pie3D();
                    break;
            }
        }
    };
})();
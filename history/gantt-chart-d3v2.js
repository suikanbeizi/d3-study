/**
 * Created by Beizi on 2017/6/19.
 */
/**
 * @author Dimitry Kudrayvtsev
 * @version 2.0
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    var minStartDate,maxEndDate;
    gantt.getTimeDomain = function(mStartDate,mEndDate){
        minStartDate=  mStartDate;
        maxEndDate=mEndDate;
        return gantt;
    };
    var margin = {
        top : 20,
        right : 60,
        bottom : 60,
        left : 60
    };
    //var timeDomainStart = d3.time.hour.offset(new Date(),-3);
    //var timeDomainEnd = d3.time.hour.offset(new Date(),+3);

    var timeDomainStart=new Date('2017-01-01');
    var timeDomainEnd=new Date('2017-06-30');
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var height = 200;
    var width = 400;

    var tickFormat = "%Y-%m-%d";

    var keyFunction = function(d) {
        return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
        return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };

    //var x = d3.time.scale().domain([ minStartDate,  maxEndDate ]).range([ 0, width ]).clamp(true);
    //var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
    //
    //var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
    //    .tickSize(10).tickPadding(8).ticks(6);
    //
    //var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var initTimeDomain = function() {
        if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
            if (tasks === undefined || tasks.length < 1) {
                timeDomainStart = '2017-01-01';
                timeDomainEnd =' 2017-06-30';
                return;
            }
            tasks.sort(function(a, b) {
                return a.endDate - b.endDate;
            });
            timeDomainEnd = tasks[tasks.length - 1].endDate;
            tasks.sort(function(a, b) {
                return a.startDate - b.startDate;
            });
            timeDomainStart = tasks[0].startDate;
        }
    };

    var initAxis = function() {
        x = d3.time.scale().domain([ minStartDate, maxEndDate ]).range([ 0, width-margin.left-margin.right ]).clamp(true);
        y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], 0.2);
        xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat))
            .tickSize(10).tickPadding(8).ticks(5);

        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    };

    function gantt(tasks) {

        initTimeDomain();
        initAxis();

        var svg = d3.select("body")
            .append("svg")
            .attr("class", "chart")
            .attr("width", width )
            .attr("height", height )
            .append("g")
            .attr("width", width-margin.left-margin.right )
            .attr("height", height-margin.top-margin.bottom )
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
        var planTip=d3.tip()
            .attr("class","factTip")
            .offset([-10,0])
            .html(function(d){
                var yStartDate= d.startDate;
                var yEndDate= d.endDate;
                return '<p>'+yStartDate.getFullYear()+'-'+(yStartDate.getMonth()+1)+'-'+yStartDate.getDate()+'<span>至</span>'+yEndDate.getFullYear()+'-'+(yEndDate.getMonth()+1)+'-'+yEndDate.getDate()+'</p>' +
                    '<p><strong>Time:</strong>'+((d.endDate-d.startDate)/1000/60/60/24)+'</p>';
            });
        svg.call(planTip);
        svg.selectAll(".chart")
            .data(tasks, keyFunction).enter()
            .append("rect")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", function(d){
                if(taskStatus[d.status] == null){ return "bar";}
                return taskStatus[d.status];
            })
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function(d) { return y.rangeBand(); })
            .attr("width", function(d) {
                return (x(d.endDate) - x(d.startDate));
            })
            .attr('fill','#669900')
            .on('mouseover', planTip.show)
            .on('mouseout', planTip.hide);

        var factTip=d3.tip()
            .attr("class","factTip")
            .offset([-10,0])
            .html(function(d){
                var yStartDate= d.fact.startDate;
                var yEndDate= d.fact.endDate;
                return '<p>'+yStartDate.getFullYear()+'-'+(yStartDate.getMonth()+1)+'-'+yStartDate.getDate()+'<span>To</span>'+yEndDate.getFullYear()+'-'+(yEndDate.getMonth()+1)+'-'+yEndDate.getDate()+'</p>' +
                    '<p><strong>Time:</strong>'+((d.endDate-d.startDate)/1000/60/60/24)+'</p>';
            });
        svg.call(factTip);
        svg.selectAll(".factChart")
            .data(tasks).enter()
            .append("rect")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", ".factChart")
            .attr("x",function(d){
                return (x(d.fact.startDate)-x(d.startDate));
            })
            .attr("y", y.rangeBand()/2/2)
            .attr("transform", rectTransform)
            .attr("height", function(d) { return y.rangeBand()/2; })
            .attr("width", function(d,i) {
                return (x(d.fact.endDate) - x(d.fact.startDate));
            })
            .attr("fill","red")
            .on('mouseover', factTip.show)
            .on('mouseout', factTip.hide);



       // console.log(y.rangeBands(20));
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-20)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .text("aa")
            .attr("transform","translate(0,0)")
            .attr("text-anchor","end")
            .attr("font-size","12px")
            .attr("color","red");

        return gantt;

    };

    gantt.redraw = function(tasks) {

        initTimeDomain();
        initAxis();

        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

        rect.enter()
            .insert("rect",":first-child")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("class", function(d){
                if(taskStatus[d.status] == null){ return "bar";}
                return taskStatus[d.status];
            })
            .transition()
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function(d) { return y.rangeBand(); })
            .attr("width", function(d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.transition()
            .attr("transform", rectTransform)
            .attr("height", function(d) { return y.rangeBand(); })
            .attr("width", function(d) {
                return (x(d.endDate) - x(d.startDate));
            });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return gantt;
    };

    gantt.margin = function(value) {
        if (!arguments.length)
            return margin;
        margin = value;
        return gantt;
    };

    gantt.timeDomain = function(value) {
        if (!arguments.length)
            return [ timeDomainStart, timeDomainEnd ];
        timeDomainStart = +value[0];
        return gantt;
    };
    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
        if (!arguments.length)
            return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    gantt.taskTypes = function(value) {
        if (!arguments.length)
            return taskTypes;
        taskTypes = value;
        return gantt;
    };

    gantt.taskStatus = function(value) {
        if (!arguments.length)
            return taskStatus;
        taskStatus = value;
        return gantt;
    };

    gantt.width = function(value) {
        if (!arguments.length)
            return width;
        width = +value;
        return gantt;
    };

    gantt.height = function(value) {
        if (!arguments.length)
            return height;
        height = +value;
        return gantt;
    };

    gantt.tickFormat = function(value) {
        if (!arguments.length)
            return tickFormat;
        tickFormat = value;
        return gantt;
    };



    return gantt;
};
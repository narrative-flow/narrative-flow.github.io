// module for drawing a scrollbar timeline
function timeline(){

  // default values
  let timelineWidth = 200;
  let timelineHeight = 700;
  let timelineStroke =7;
  let pageLength = 0;
  let pageHeight = 0;
  let windowPosition = 0;
  let discreteMarks = false;
  let stepperTimeline = false;

  // module selections
  let timelineSvg, timelineScale, windowMarker, textMarkers, visMarkers, timelineReverseScale, data;

  // generator to draw the scrollbar timeline
  function timeline(selection){
    // for every selection
    selection.each(function(d, i){

      // load in data
      data = d;

      // create svg
      timelineSvg = d3.select(this).append("svg")
        .attr("width", timelineWidth)
        .attr("height", timelineHeight);
      
      // draw time/scroll line
      timelineSvg.append("line")
        .attr("y1", 0)
        .attr("y2", timelineHeight)
        .attr("x1", timelineWidth / 2)
        .attr("x2", timelineWidth / 2)
        .style("stroke", "rgb(79.6%, 79.6%, 79.6%)")
        .style("stroke-width", timelineStroke);
      
      // create scale along scroll position
      timelineScale = d3.scaleLinear()
        .domain([0, pageLength])
        .range([0, timelineHeight])
        .clamp(true);
      timelineReverseScale = d3.scaleLinear()
        .domain([0, timelineHeight])
        .range([0, pageLength])
        .clamp(true);
      
      // cover up timeline for stepper states
      if(stepperTimeline){
        let marker = pageHeight;
        for(let i = 1; i < d.text.length; i++){
          timelineSvg.append("line")
            .attr("y1", timelineScale(marker))
            .attr("y2", timelineScale(d.text[i][0] - pageHeight / 6))
            .attr("x1", timelineWidth / 2)
            .attr("x2", timelineWidth / 2)
            .style("stroke", "#FFF")
            .style("stroke-width", timelineStroke * 2);
          marker = d.text[i][0] - pageHeight / 6;
          marker += pageHeight;
        }
        timelineSvg.append("line")
          .attr("y1", timelineScale(marker))
          .attr("y2", timelineScale(marker + pageHeight))
          .attr("x1", timelineWidth / 2)
          .attr("x2", timelineWidth / 2)
          .style("stroke", "#FFF")
          .style("stroke-width", timelineStroke * 2);
      }
      
      // draw window marker
      windowMarker = timelineSvg.append("g")
        .attr("transform", "translate(" + (timelineStroke * 3.5) + "," + 0 + ")");
      windowMarker.append("rect")
        .attr("width", timelineStroke * 10)
        .attr("height", timelineScale(pageHeight))
        .style("fill", "#efefef");
      windowMarker.append("line")
        .attr("x1", 0)
        .attr("x2", timelineStroke * 10)
        .attr("y1", 0)
        .attr("y2", 0)
        .style("stroke", "#4daf4a")
        .style("stroke-width", timelineStroke / 4);
      
      // draw text positions
      textMarkers = timelineSvg.append("g")
        .attr("transform", "translate(" + (timelineStroke * 6) + "," + 0 + ")");
      textMarkers.selectAll("rect")
        .data(d.text).enter().append("rect")
          .attr("x", 0)
          .attr("width", timelineStroke * 3)
          .attr("y", function(d){
            return timelineScale(d[0]);
          })
          .attr("height", function(d){
            return timelineScale(d[1] - d[0]);
          })
          .style("fill", "#377eb8");

      // draw vis positions
      visMarkers = timelineSvg.append("g")
        .attr("transform", "translate(" + (timelineWidth / 2 - timelineStroke) + "," + 0 + ")");
      visMarkers.selectAll("line")
        .data(d.vis).enter().append("g").attr("class", "marker").append("line")
          .attr("class", "marker-start")
          .attr("x1", -timelineStroke * 2)
          .attr("x2", 0)
          .attr("y1", function(d){
            return timelineScale(d);
          })
          .attr("y2", function(d){
            return timelineScale(d);
          })
          .style("stroke", "#e41a1c")
         .style("stroke-width", timelineStroke / 2);
      
      // if we do NOT have discrete mode, show the interval marker
      if(!discreteMarks){
        visMarkers.selectAll(".marker").each(function(data, i){
          d3.select(this)
            .append("line").attr("class", "marker-interval")
              .attr("y1", timelineScale(data))
              .attr("y2", timelineScale(d.visEnd[i]))
              .attr("x1", -timelineStroke * 2)
              .attr("x2", -timelineStroke * 2)
              .style("stroke", "#e41a1c")
              .style("stroke-width", timelineStroke / 2);
          d3.select(this)
            .append("line").attr("class", "marker-end")
              .attr("y1", timelineScale(d.visEnd[i]))
              .attr("y2", timelineScale(d.visEnd[i]))
              .attr("x1", -timelineStroke * 2)
              .attr("x2", 0)
              .style("stroke", "#e41a1c")
              .style("stroke-width", timelineStroke / 2);
        });
      }

      // ignore last marker
      visMarkers.each(function(data){
        d3.select(this).selectAll(".marker").each(function(d, i){
          if(i >= data.vis.length - 1){
            this.remove();
          }
        });
      });
    });
  }

  // update window marker position
  timeline.updateWindowMarker = function(value, animate){
    windowPosition = value;
    windowMarker
      .transition().duration(animate ? transitionTime : 0)
        .attr("transform", "translate(" + (timelineStroke * 3.5) + "," + timelineScale(windowPosition) + ")");
  };

  // set up interactions for timeline
  timeline.textDrag = function(drag, end){
    textMarkers.selectAll("rect").call(d3.drag().on("start", startTextDrag));
    function startTextDrag(){
      let rect = d3.select(this).classed("dragging", true);
      d3.event.on("drag", dragged).on("end", ended);
      function dragged(d, i){
        rect.attr("y", d.y = d3.event.y);
        let offset = timelineReverseScale(rect.attr("y")) - data.text[i][0];
        drag(d, i, offset);
      }
      function ended(d, i){
        rect.classed("dragging", false);
        let offset = timelineReverseScale(rect.attr("y")) - data.text[i][0];
        end(d, i, offset);
      }
    }
  };

  timeline.visMarkerStart = function(end){
    visMarkers.selectAll("line.marker-start").call(d3.drag().on("start", started));
    function started(){
      let line = d3.select(this).classed("dragging", true);
      let interval = d3.select(this).selectAll(function(){
        return [this.nextElementSibling];
      });
      d3.event.on("drag", dragged).on("end", ended);
      function dragged(d, i){
        if(!discreteMarks){
          interval.attr("y1", d.y = d3.event.y);
        }
        line.attr("y1", d.y = d3.event.y).attr("y2", d.y = d3.event.y);
      }
      function ended(d, i){
        line.classed("dragging", false);
        let y = views.timeline.reverseScale()(line.attr("y1"));
        end(d, i, y);
      }
    }
  };

  timeline.visMarkerEnd = function(end){
    visMarkers.selectAll("line.marker-end").call(d3.drag().on("start", startedEnd));
    function startedEnd(){
      let line = d3.select(this).classed("dragging", true);
      let interval = d3.select(this).selectAll(function(){
        return [this.previousElementSibling];
      });
      d3.event.on("drag", dragged).on("end", ended);
      function dragged(d, i){
        interval.attr("y2", d.y = d3.event.y);
        line.attr("y1", d.y = d3.event.y).attr("y2", d.y = d3.event.y);
      }
      function ended(d, i){
        line.classed("dragging", false);
        let y = timelineReverseScale(line.attr("y1"));
        end(d, i, y);
      }
    }
  };

  timeline.visMarker = function(ending){
    visMarkers.selectAll("line.marker-interval").call(d3.drag().on("start", startedInterval));
    function startedInterval(){
      let line = d3.select(this).classed("dragging", true);
      let start = d3.select(this).selectAll(function(){
        return [this.previousElementSibling];
      });
      let end = d3.select(this).selectAll(function(){
        return [this.nextElementSibling];
      });
      d3.event.on("drag", dragged).on("end", ended);
      function dragged(d, i){
        let interval = line.attr("y2") - line.attr("y1");
        line.attr("y1", d.y = d3.event.y - interval / 2).attr("y2", d.y = d3.event.y + interval / 2);
        start.attr("y1", d.y = d3.event.y - interval / 2).attr("y2", d.y = d3.event.y - interval / 2);
        end.attr("y1", d.y = d3.event.y + interval / 2).attr("y2", d.y = d3.event.y + interval / 2);
      }
      function ended(d, i){
        line.classed("dragging", false);
        let y1 = timelineReverseScale(start.attr("y1"));
        let y2 = timelineReverseScale(end.attr("y1"));
        ending(d, i, y1, y2);
      }
    }
  };

  // getters / setters
  timeline.width = function(value){
    if(!arguments.length){
      return timelineWidth;
    }
    timelineWidth = value;
    return timeline;
  };
  timeline.height = function(value){
    if(!arguments.length){
      return timelineHeight;
    }
    timelineHeight = value;
    return timeline;
  };
  timeline.pageLength = function(value){
    if(!arguments.length){
      return pageLength;
    }
    pageLength = value;
    return timeline;
  };
  timeline.pageHeight = function(value){
    if(!arguments.length){
      return pageHeight;
    }
    pageHeight = value;
    return timeline;
  };
  timeline.textMarkers = function(){
    return textMarkers;
  };
  timeline.visMarkers = function(){
    return visMarkers;
  };
  timeline.reverseScale = function(){
    return timelineReverseScale;
  };
  timeline.discreteMarkers = function(){
    discreteMarks = true;
    return discreteMarks;
  };
  timeline.stepperTimeline = function(){
    stepperTimeline = true;
    return stepperTimeline;
  }

  // return the timeline generator
  return timeline;
}

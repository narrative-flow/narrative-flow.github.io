// module for drawing icons inside an svg
function icons(){
  
  // default values
  let iconSize = 100;
  let location = '';
  let extension = 'png';

  // d3 selections for icons
  let svg, iconGroup, allIcons, data;

  // variables passed in from bar chart
  let height, xpos;

  // generator to draw icons
  // icons from: http://www.svgcuttabledesigns.com/the-simpsons-exclusive-svg-only/
  // TODO check license of icons, may need to pay for it, may be fine
  function icons(selection){
    // for every selection
    selection.each(function(d, i){
      svg = d3.select(this).select('svg');
      iconGroup = svg.append("g").attr("class", "icons");
      allIcons = iconGroup.selectAll("image")
        .data(d.value)
        .enter().append("image")
          .attr("x", 0)
          .attr("y", function(d2, i2){
             return 85 + i2 * 60;
          }).attr("width", iconSize)
          .attr("height", iconSize)
          .attr("xlink:href", function(d2, i2){
            // use original data to get character names
            return location + d.rowLabel[i2] + "." + extension;
          }).attr("opacity", 1);
      data = d;
    });
  }

  // state definitions for icons
  icons.fadeIn = function(elements){
    return elements.attr("opacity", 1);
  };
  icons.fadeOut = function(elements){
    return elements.attr("opacity", 0);
  };
  icons.nextToTable = function(elements){
    return elements.attr("x", 0)
          .attr("y", function(d, i){
            return 85 + i * 60;
          });
  };
  icons.moveOverTable = function(elements){
    return elements.attr("x", 90)
          .attr("y", function(d, i){
            return 85 + i * 60;
          });
  };
  icons.moveToChart = function(elements){
    let yIterF = data.value.filter(function(d){
      if(d[0] === "F"){
        return true;
      }}).length;
    let yIterM = data.value.length - yIterF;
    let bottom = height - 20;
  
    return elements.attr("x", function(d, i){
        return xpos(d[0]) + 4;
      }).attr("y", function(d, i){
        if(d[0] === "F"){
          yIterF -= 1;
          return bottom - yIterF * 60;
        }else{
          yIterM -= 1;
          return bottom - yIterM * 60;
        }
      });
  };

  // element definitions
  icons.allIcons = function(){
    return allIcons;
  };

 // getters / setters
  icons.iconSize = function(value){
    if(!arguments.length){
      return iconSize;
    }
    iconSize = value;
    return icons;
  };
  icons.location = function(value){
    if(!arguments.length){
      return location;
    }
    location = value;
    return icons;
  };
  icons.extension = function(value){
    if(!arguments.length){
      return extension;
    }
    extension = value;
    return icons;
  };
  icons.barHeight = function(value){
    if(!arguments.length){
      return height;
    }
    height = value;
    return icons;
  };
  icons.xPos = function(value){
    if(!arguments.length){
      return xpos;
    }
    xpos = value;
    return icons;
  };

  // return the icons generator
  return icons;
}
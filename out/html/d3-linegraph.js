/*
 * generating a line graph of multipile parties with multiple dates...
 * */

function addMonths(date, months) {
    date = new Date(date);
    var d = date.getDate();
    date.setMonth(date.getMonth() + months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
}


d3.linegraph = function(noTicks, noDots, parties, partyColors, partyNames, dataMax, dataMin, additionalMonths) {
    /* params */
    if (!parties) {
        parties = ['IRSP', 'Provisionals', 'Officials', 'IRs', 'ILs', 'SDLP', 'alliance', 'NILP', 'UUP', 'DUP', 'Vanguard', 'UP_NI', 'FF', 'FG', 'Labour', 'INDs'];
    }
    if (!partyColors) {
        partyColors = {'IRSP': '#FF7F7F', 'Provisionals': '#008000', 'Officials': '#CC3333', 'IRs': '#90bc7c', 'ILs': '#eae374', 'SDLP': '#98FB98', 'alliance': '#FFFF00', 'NILP': '#FFC0CB', 'UUP': '#C17E5A', 'DUP': '#FFA500', 'Vanguard': '#FFD580', 'UP_NI': '#ffcc66', 'FF': '#009E58', 'FG': '#18eaed', 'Labour': '#cc0000', 'INDs': '#999999'};
    }
    if (!partyNames) {
        partyNames = {'IRSP': 'IRSP', 'Provisionals': 'Provisionals', 'Officials': 'Officials', 'IRs': 'Independent Republicans', 'ILs': 'Independent Unionists', 'SDLP': 'SDLP', 'alliance': 'Alliance', 'NILP': 'NILP', 'UUP': 'UUP', 'DUP': 'DUP', 'Vanguard': 'Vanguard', 'UP_NI': 'Unionist Party of Northern Ireland', 'FF': 'Fianna Fáil', 'FG': 'Fine Gael', 'Labour': 'Labour', 'INDs': 'Independents'};
    }
    if (!additionalMonths) {
        additionalMonths = 10;
    }

    // Declare the chart dimensions and margins.
    var width = 500;
    var height = 400;
    var marginTop = 20;
    var marginRight = 20;
    var marginBottom = 50;
    var marginLeft = 40;

    function linegraph(dataset) {
     dataset.each(function (data) {
      const dates = data.map(d => new Date(d.date));
      // Map the data to an array of arrays of {x, y} tuples.
      const series = parties.map(party => data.map(d => ({'x': new Date(d.date), 'y': d[party], 'series': party})));

      // Declare the x (horizontal position) scale.
      const maxDate = d3.max(dates);
      const xScale = d3.scaleUtc([new Date(1928, 0), addMonths(maxDate, additionalMonths)], [marginLeft, width - marginRight]);

      var xaxis = d3.axisBottom()
        .tickFormat(d3.timeFormat('%b %Y'))
        .tickValues(dates)
        .scale(xScale);
      if (noTicks) {
        xaxis = d3.axisBottom()
        .tickFormat(d3.timeFormat('%b %Y'))
        .ticks(10)
        .scale(xScale);
      }

      // Declare the y (vertical position) scale.
      if (!dataMax) {
          const maxSPD = d3.max(data, d => d.spd);
          const maxNSDAP = d3.max(data, d => d.nsdap);
          dataMax = maxSPD >= maxNSDAP ? maxSPD + 10 : maxNSDAP + 10;
          dataMin = 0;
      }
      const yScale = d3.scaleLinear([dataMin, dataMax], [height - marginBottom, marginTop]);

      //Create the SVG container.
      //const svg = d3.create("svg")
      //    .attr("width", width)
      //    .attr("height", height);
     var svg = d3.select(this);


      // Add the x-axis.
      svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(xaxis)
          .selectAll("text")
          .attr("text-anchor", "end")
          .attr("dx", "-0.8em")
          .attr("dy", "0.1em")
          .attr("transform", "rotate(-30)");

      // Add the y-axis.
      svg.append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(d3.axisLeft(yScale));

      const partyLine = (party) => d3.line()
          .x(d => xScale(new Date(d.date)))
          .y(d => yScale(d[party]));

      // draw the lines
      for (const party of parties) {
        svg.append("path")
          .attr("fill", "none")
          .attr("stroke", partyColors[party])
          .attr("stroke-width", 1.5)
          .attr("class", party + " " + "party-line")
          .attr("id", party+"-line")
          .attr("series", party)
          .attr("d", partyLine(party)(data))
          .on("mouseover", function (d) {
              d3.selectAll(".party-line").attr("stroke-width", 0.1);
              d3.selectAll(".party-node").attr("fill-opacity", 0.1);
              d3.selectAll(".party-label").attr("opacity", 0.1);
              d3.selectAll("."+party+'-node').attr("fill-opacity", 1);
              d3.selectAll("."+party+'-label').attr("opacity", 1);
              d3.select(this).attr("stroke-width", 5);
          })
          .on("mouseout", function (d) {
            d3.selectAll(".party-line").attr("stroke-width", 1.5);
            d3.selectAll(".party-node").attr("fill-opacity", 1);
            d3.selectAll(".party-label").attr("opacity", 1);
          });
      }

      // draw nodes
      const z = d3.scaleOrdinal(d3.schemeCategory10);
      if (!noDots) {
          svg.selectAll(".series")
              .data(series)
            .enter().append("g")
            .selectAll(".point")
              .data(d => d)
            .enter().append("circle")
              .attr("class", d => d.series + " " + d.series+"-node " + "party-node")
              .attr("fill", d => partyColors[d.series])
              .attr("series", d => d.series)
              .attr("r", 4)
              .attr("cx", d => xScale(d.x))
              .attr("cy", d => yScale(d.y))
              .on("mouseover", function (d) {
                  const node = d3.select(this);
                  const series = node.attr('series');
                  d3.selectAll(".party-line").attr("stroke-width", 0.1);
                  d3.selectAll(".party-node").attr("fill-opacity", 0.1);
                  d3.selectAll(".party-label").attr("opacity", 0.1);
                  d3.selectAll("."+series+'-node').attr("fill-opacity", 1);
                  d3.selectAll("#"+series+'-line').attr("stroke-width", 5);
                  d3.selectAll("."+series+'-label').attr("opacity", 1);
              })
              .on("mouseout", function (d) {
                  d3.selectAll(".party-line").attr("stroke-width", 1.5);
                  d3.selectAll(".party-node").attr("fill-opacity", 1);
                  d3.selectAll(".party-label").attr("opacity", 1);
              });
      }

      // draw right-hand labels
      svg.selectAll(".labels")
        .data(series)
        .enter().append("text")
        .text(s => partyNames[s[0].series])
        .attr("series", s => s[0].series)
        .attr("font-size", "0.8em")
        .attr("class", s => s[0].series + "-label party-label")
        .attr("x", s => xScale(s[s.length - 1].x) + 15)
        .attr("y", s => yScale(s[s.length - 1].y) + 5)
        .on("mouseover", function (d) {
          const text = d3.select(this);
          const series = text.attr('series');
          d3.selectAll(".party-line").attr("stroke-width", 0.1);
          d3.selectAll(".party-node").attr("fill-opacity", 0.1);
          d3.selectAll(".party-label").attr("opacity", 0.1);
          d3.selectAll("."+series+'-node').attr("fill-opacity", 1);
          d3.selectAll("#"+series+'-line').attr("stroke-width", 5);
          d3.selectAll("."+series+'-label').attr("opacity", 1);
        })
        .on("mouseout", function (d) {
          d3.selectAll(".party-line").attr("stroke-width", 1.5);
          d3.selectAll(".party-node").attr("fill-opacity", 1);
          d3.selectAll(".party-label").attr("opacity", 1);
        });

     });
    }

    linegraph.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return linegraph;
    };

    linegraph.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return linegraph;
    };

    linegraph.parties = function(value) {
        if (!arguments.length) return parties;
        parties = value;
        return linegraph;
    };

    linegraph.partyNames = function(value) {
        if (!arguments.length) return partyNames;
        partyNames = value;
        return linegraph;
    };

    linegraph.partyColors = function(value) {
        if (!arguments.length) return partyColors;
        partyColors = value;
        return linegraph;
    };

    return linegraph;
};

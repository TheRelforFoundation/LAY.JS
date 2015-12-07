
LAY.run({
  data: {
    mobileResponsiveWidth: 550,
    sidebarResponsiveWidth: 900,
    gray230: LAY.rgb(230,230,230)
  },
  props: {
    backgroundColor: LAY.color("whitesmoke"),
    overflowY: "scroll",
    textFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    textSmoothing: "antialiased",
    textColor: LAY.rgb(77,77,77),
    textSize: 14,
    textWeight: "300",
    textLineHeight: 1.4,
    userSelect: "none"
  },

  "App": {
    props: {
      width: LAY.take("/", "data.mobileResponsiveWidth"),
      centerX: LAY.take("../", "$midpointX").plus(
        LAY.take("../Learn", "$midpointX")),
      overflow: "visible"
    },
    states: {
      "nosidebar": {
        onlyif: LAY.take("/", "width").lt(
          LAY.take("/", "data.sidebarResponsiveWidth")),
        props: {
          centerX: LAY.take("../", "$midpointX")
        }
      },
      "responsive": {
        onlyif: LAY.take("/", "width").lt(
          LAY.take("/", "data.mobileResponsiveWidth")),
        props: {
          width: LAY.take("/", "width")
        }
      },
    },

    "Header": {
      props: {
        width: LAY.take("../", "width"),
        text: "todos",
        textSize: 100,
        textColor: LAY.rgba(175, 47, 47, 0.15),
        textAlign:"center",
        textRendering: "optimizeLegibility",
        textWeight: "100"
      }
    },
    "Container": {
      props:{
        top: LAY.take("../Header", "bottom"),
        centerX: LAY.take("../", "$midpointX"),
        width: LAY.take("../", "width"),
        backgroundColor:  LAY.color("white"),
        overflow: "visible",
        boxShadows: [
          {x:0, y:2, blur:4, color: LAY.rgba(0,0,0,0.2)  },
          {x:0, y:25, blur:50, color: LAY.rgba(0,0,0,0.1) }, 
        ]
      },
      states: {
        "sheets-displayed": {
          onlyif: LAY.take("Sheets", "hidden.onlyif").not(),
          props: {
            height: LAY.take("", "$naturalHeight").subtract(
          LAY.take("Sheets", "height"))
          }
        }
      },
      
      "TopControls": {
        props: {
          width: LAY.take("../", "width"),
          boxShadows: [ 
                    {inset:true, x:0, y:-2, blur: 1,
                    color: LAY.rgba(0,0,0,0.03) }
                  ]

        },
        "CompleteToggle": {
          data: {
            allCompleted:
              LAY.take("/App/Container/Todos/Todo", "rows").length().gt(0).and(
                LAY.take("/App/Container/Todos/Todo", "rows").filterEq(
                  "complete", false).length().eq(0))
           
          },
          props: {
            width: 40,
            height: 40,
            centerY: LAY.take("../Input", "centerY"),
            cursor: "default",
            text: "❯",
            textSize: 22,
            // Text line height should equal
            // the width (division for conversion
            // to "em")
            textLineHeight: LAY.take("", "width").divide(
              LAY.take("", "textSize")),
            textAlign: "center",
            rotateZ: 90
          },
          states: {
            "hidden": {
              onlyif: LAY.take("/App/Container/Todos/Todo", "rows").length().eq(0),
              props: {
                visible: false
              }
            },
            "incomplete": {
              onlyif: LAY.take("", "data.allCompleted").not(),
              props: {
                textColor: LAY.take("/", "data.gray230")
              },
              when: {
                click: function () {
                  LAY.level("/App/Container/Todos/Todo").rowsUpdate(
                  "complete", true );
                  updateLocalStorage();
                }
              }
            },
            "completed": {
              onlyif: LAY.take("", "data.allCompleted"),
              props: {
                textColor: LAY.rgb(115,115,155)
              },
              when: {
                click: function () {
                  LAY.level("/App/Container/Todos/Todo").rowsUpdate(
                  "complete", false );
                  updateLocalStorage();
                }
              }
            }
          }
        },
        "Input": {
          $type: "input:line",
          props: {
            left: LAY.take("../CompleteToggle", "right"),
            width: LAY.take("../", "width").subtract(
              LAY.take("../CompleteToggle", "height")),
            backgroundColor: LAY.rgba(0, 0, 0, 0.003),
            textSize: 24,
            textPadding: 16,
            textSmoothing: "antialiased",
            textLineHeight:1.4,
            inputPlaceholder: "What needs to be done?",
            focus: true
          },
          when: {
            keypress: function (e) {
              if (e.keyCode === 13) { //enter
                var val = this.attr("$input").trim();
                if ( val ) {
                  this.changeNativeInput("");
                  LAY.level("/App/Container/Todos/Todo").rowAdd(
                    {id:Date.now(), title:val, complete:false});
                  updateLocalStorage();
                }
              }
            }
          }
        }
      },
      "Todos": {
        props:{
          top: LAY.take("../TopControls", "bottom"),
          width: LAY.take("../", "width"),
          borderTop:{ 
            style:"solid",
            width:1,
            color: LAY.take("/", "data.gray230")
          }
        },
        states: {
          "hidden": {
            onlyif: LAY.take("Todo", "rows").length().eq(0),
            props: {
              display:false
            }
          }
        },
        "Todo": {
          many: {
            formation: "onebelow",
            $load: function () {
              if ( window.localStorage && window.JSON ) {
                var todos = localStorage.getItem("todos");
                if (todos) {
                  this.rowsCommit(JSON.parse(todos));
                }
              }
            },
            sort: [
              {key: "id"}
            ],
            data: {
              category: LAY.take("/App/Container/BottomControls/Strip/Categories/Category", "rows").filterEq("selected", true).index(0).key("id")
            },           
            states: {
              "active": {
                onlyif: LAY.take("", "data.category").eq("active"),
                filter: LAY.take("", "rows").filterEq("complete", false)
                
              },
              "completed": {
                onlyif: LAY.take("", "data.category").eq("completed"),
                filter: LAY.take("", "rows").filterEq("complete", true)
              }
            }
          },
          data: {
            isEditing: false
          },
          props: {
            width:LAY.take("../", "width"),
            borderBottom: {
              width:1, style:"solid",
              color: LAY.rgb(237,237,237)
            },
            overflow: "visible" //border overflow of input
          },
                    
          "Tick": {
            props: {
              width: 40,
              height: 40,
              centerY: LAY.take("../", "$midpointY")
            },
            states: {
              "hidden": {
                onlyif: LAY.take("../", "data.isEditing"),
                props: {
                  visible: false
                }
              },
              "complete": {
                onlyif: LAY.take("../", "row.complete"),
                props: {
                  text: LAY.take('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#bddad5" stroke-width="3"/><path fill="#5dc2af" d="M72 25L42 71 27 56l-4 4 20 20 34-52z"/></svg>').format(
                    LAY.take("", "width"),LAY.take("", "height"))
                },
                when: {
                  click: function () {
                    this.level("../").row("complete", false);
                    updateLocalStorage();
                  }
                }
              },
              "incomplete": {
                onlyif: LAY.take("../", "row.complete").not(),
                props: {
                  text: LAY.take('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#ededed" stroke-width="3"/></svg>').format(
                    LAY.take("", "width"),LAY.take("", "height"))
                },
                when: {
                  click: function () {
                    this.level("../").row("complete", true);
                    updateLocalStorage();
                  }
                }
              }
            }
          },
            "Title": {
              props: {
                left: LAY.take("../Tick", "right"),
                width: LAY.take("../", "width").subtract(
                  LAY.take("", "left")),
                text: LAY.take("../", "row.title"),
                textPadding:15,
                textSize: 24,
                textWordWrap: "break-word",
                textWrap: "pre",
                textLineHeight: 1.2,
                userSelect: "text"
              },
              states: {
                "hidden": {
                  onlyif: LAY.take("../", "data.isEditing"),
                  props: {
                    display: false
                  }
                },
                "complete": {
                  onlyif: LAY.take("../", "row.complete"),
                  props: {
                    textDecoration: "line-through",
                    textColor: LAY.color("gainsboro")
                  }
                },
                "incomplete": {
                  onlyif: LAY.take("../", "row.complete").not()
                }
              },
              transition: {
                textColor: {
                  type: "ease-out",
                  duration: 400
                }
              },
              when: {
                dblclick: function () {
                  this.level("../").data("isEditing", true );
                }
              }
            },
            "Input": {
              $type: "input:line",
              props: {
                display: false,
                left: LAY.take("../Tick", "right"),
                width: LAY.take("../", "width").subtract(
                  LAY.take("", "left")),
                border: {
                  style:"solid", width:1,
                    color: LAY.hex(0x999999)
                },
                boxShadows: [
                  { inset:true, x:0, y: -1, blur: 5,
                   color:LAY.rgba(0, 0, 0, 0.2) }
                ],
                input: LAY.take("../", "row.title"),
                textPadding:15,
                textSize: 24,
                textLineHeight:1.2
              },
              states: {
                "shown": {
                  onlyif: LAY.take("../", "data.isEditing"),
                  props: {
                    display: true,
                    focus: true
                  }
                }
              },
              when: {
                keyup: function (e) {
                  if (e.keyCode === 13) { //enter
                    var val = this.attr("$input").trim();
                    if ( val === "") { //delete item
                      this.level("../").remove();
                    } else {
                      this.level("../").row("title", val );
                      this.level("../").data("isEditing", false );
                    }
                    updateLocalStorage();
                  } else if ( e.keyCode === 27) {
                    // reset the original value
                    this.changeNativeInput(
                      this.level("../").attr("row.title"));
                    this.level("../").data("isEditing", false );
                  }
                },
                blur: function () {
                  var val = this.attr("$input").trim();
                    if ( val === "") { //delete item
                      this.level("../").remove();
                    } else {
                      this.level("../").row("title", val );
                      this.level("../").data("isEditing", false );
                    }
                    updateLocalStorage();
                }
              }
            },
            "Cross": {
              props: {
                centerY: LAY.take("../", "$midpointY"),
                right: 10,
                width:40,
                height:40,
                cursor: "default",
                text: "×",
                textSize: 30,
                textLineHeight: 40/30,
                textAlign: "center",
                textColor: LAY.hex(0xcc9a9a)
              },
              states:{
                "hidden": {
                  onlyif: LAY.take("../", "$hovering").not().or(
                    LAY.take("../", "data.isEditing")),
                  props: {
                    visible: false
                  }
                },
                "hovering":{
                  onlyif: LAY.take("","$hovering"),
                  props: {
                    textColor: LAY.hex(0xaf5b5e)
                  }
                }
              },
              transition: {
                textColor: {
                  type: "ease-out",
                  duration: 200
                }
              },
              when: {
                click: function () {
                  LAY.level("/App/Container/Todos/Todo").rowDeleteByID(
                    this.level("../").attr("row.id"));
                  updateLocalStorage();
                }
              }
            }
          }
        },
        "BottomControls": {
          props: {
            height: 42,
            width:LAY.take("../", 'width'),
            top: LAY.take("../Todos", "bottom"),
            borderTop: {style:"solid", width: 1,
              color: LAY.hex(0xe6e6e6)},
            textColor: LAY.rgb(119, 119, 119),
            textLineHeight:1
          },
          states: {
            "hidden": {
              onlyif: LAY.take("../Sheets", "hidden.onlyif"),
              props: {
                display: false
              }
            }
          },
          "Strip": {
            props: {
              width: LAY.take("../", "width").subtract(30),
              centerX: LAY.take("../", "$midpointX"),
              centerY: LAY.take("../", "$midpointY")
            },
            "RemainingCount": {
              data: {
                remaining: LAY.take("/App/Container/Todos/Todo", "rows").filterEq("complete", false).length()
              },
              props: {
                centerY: LAY.take("../", "$midpointY"),
                text: LAY.take("%d items left").format(LAY.take("", "data.remaining"))
              },
              states: {
                "single": {
                  onlyif: LAY.take("", "data.remaining").eq(1),
                  props: {
                    text: "1 item left"
                  }
                }
              }
            },
            "Categories": {
              props: {
                centerX: LAY.take("../", "$midpointX")
              },
              "Category": {  
                many: {
                  $load: function () {
                    var hash = window.location.hash || "#/";
                    var hashVal = hash.slice(2);
                    
                    if ( ["", "active", "completed" ].indexOf( hashVal ) !== -1 ) {
                      LAY.clog();
                      this.rowsUpdate("selected", false);
                      this.rowsUpdate("selected", true,
                        this.queryRows().filterEq("id", hashVal ));
                      LAY.unclog();
                    } 
                    
                  },
                  formation: "totheright",
                  fargs: {
                    totheright: {
                      gap:10
                    }
                  },
                  $id: "id",
                  rows: [
                    {id: "", text: "All", selected: true },
                    {id: "active" , text: "Active", selected: false },
                    {id: "completed", text: "Completed", selected: false }
                  ]
                },
                $type: "link",             
                props: {
                  cursor:"pointer",
                  border: {style: "solid", width: 1,
                    color: LAY.transparent()},
                  cornerRadius: 3,
                  text: LAY.take("", "row.text"),
                  textPadding: 6,
                  linkHref: LAY.take("#/%s").format(
                    LAY.take("", "row.id"))
                },
                states: {
                  "selected": {
                    onlyif: LAY.take("", "row.selected"),
                    props: {
                      borderColor: LAY.rgba(175, 47, 47, 0.2)
                    }
                  },
                  "hover": {
                    onlyif: LAY.take("", "$hovering").eq(true).and(
                      LAY.take("", "row.selected").not()),
                    props: {
                      borderColor: LAY.rgba(175, 47, 47, 0.1)
                    }
                  }
                },
                when: {
                  click: function () {
                    if ( !this.attr("row.selected") ) {
                      LAY.clog();
                      this.many().rowsUpdate("selected", false);
                      this.row("selected", true);
                      LAY.unclog();
                    }
                  }
                }
              }                   
            },
            "ClearCompleted": {
              props: {
                cursor: "pointer",
                right: 0,
                centerY: LAY.take("../", "$midpointY"),
                text: "Clear completed"
              },
              when: {
                click: function () {
                  var many = LAY.level("/App/Container/Todos/Todo");
                  many.rowsDelete(
                    many.queryRows().filterEq("complete", true ) );
                  updateLocalStorage();
                }
              },
              states: {
                "hidden": {
                  onlyif: LAY.take("/App/Container/Todos/Todo", "rows").filterEq("complete", true).length().eq(0),
                  props: {
                    visible: false
                  }
                },
                "hover": {
                  onlyif: LAY.take("", "$hovering"),
                  props: {
                    textDecoration: "underline"
                  }
                }
              }
            }
          }
        },
        "Sheets": {
          props: {
            width: LAY.take("../", "width"),
            height:50,
            shiftY:LAY.take("", "height").negative(),
            backgroundColor: LAY.transparent(),
            top: LAY.take("../BottomControls", "bottom"),
            zIndex: "-1",
            boxShadows: [
              {x:0, y:1, blur:1, color: LAY.rgba(0,0,0,0.2) },
              {x:0, y:8, blur:0, spread:-3, color: LAY.rgb(246,246,246) },
              {x:0, y:9, blur:1, spread:-3 ,color: LAY.rgba(0,0,0,0.2) },
              {x:0, y:16, blur:0, spread:-6, color: LAY.rgb(246,246,246) },
              {x:0, y:17, blur:2, spread:-6, color: LAY.rgba(0,0,0,0.2) }
            ]
          },
          states: {
            "hidden": {
              onlyif: LAY.take("/App/Container/Todos/Todo", "rows").length().eq(0),
              props: {
                display: false
              }
            }
          }
        }      
      },
      "Footer": {
        props: {
          top: LAY.take("../Container", "bottom").add(40),
          width: LAY.take("../", "width"),
          textAlign:"center",
          textShadows: [
            {x: 0, y:1, blur:1, color: LAY.rgba(255,255,255,0.5)}
          ],
          textSize:10,
          textColor: LAY.rgb(191,191,191),
          text: LAY.take("", "row.content"),
          textLineHeight: 1
        },
        many: {
          formation: "onebelow",
          fargs: {
            onebelow: {
              gap: 10
            }
          },
          rows: [
            "Double-click to edit a todo",
            "Created by <a href='https://github.com/relfor' " +
              "class='link'>Relfor</a>",
            "Part of <a href='http://todomvc.com' " +
              "class='link'>TodoMVC</a>"
          ]
        }
      }
    },
    "Learn": {
      props: {
        width: 300,
        height:200,
        backgroundColor: LAY.rgba(255,255,255,0.6),
        userSelect: "auto"         
      },
      states: {
        "hidden": {
          onlyif: LAY.take("/", "width").lt(
            LAY.take("/", "data.sidebarResponsiveWidth")),
          props: {
            left: LAY.take("", "width").negative()
          }
        }
      },
      transition: {
        left: {
          type: "ease",
          duration: 500
        }
      },
      
      "Wrapper": {
        props: {
          width: LAY.take("../", "width").minus(40),
          height: LAY.take("../", "height").minus(40),
          centerX: LAY.take("../", "$midpointX")
        },
        
        "Name": {
          props: {
            top: 20,
            text: "LAY.JS",
            textWeight: "bold",
            textSize: 24
          }
        },
        "Examples": {
          props: {
            top: LAY.take("../Name", "bottom").add(
              LAY.take("Example", "fargs.onebelow.gap"))
          },          
          "Example": {
            many: {
              formation:"onebelow",
              fargs: {onebelow:{gap:8}},
              rows: [{id:1, title:"Example", links: "<a href='/'>Source</a>"}]
            },
            "Title": {
              props: {
                text: LAY.take("../", "row.title"),
                textWeight: "bold"
              }
            },
            "Links": {
              props: {
                top: LAY.take("../Title", "bottom"),
                text: LAY.take("../", "row.links")
              }
            }
          }
        },
        "FirstLine": {
          props: {
            top: LAY.take("../Examples", "bottom").add(10),
            width: LAY.take("../", "width"),
            height:2,
            border: {
              top: {style:"dashed", width:1,
               color: LAY.hex(0xc5c5c5)},
              bottom: {style:"dashed", width:1,
                color: LAY.hex(0xf7f7f7)}
            }
          }
        },
        "Quote": {
          props: {
            top: LAY.take("../FirstLine", "bottom").add(10),
            text: "LAY is a rendering engine written " +
              "in Javascript with the purpose to " +
              "augment and substitute for the shortcomings " +
              "of HTML markup and CSS stylesheets."
          }
        },
        "SecondLine": {
          $inherit: "../FirstLine",
          props: {
            top: LAY.take("../Quote", "bottom").add(10)
          }
        }
        
      }
      
    }
     
});

/*
LAY.run({
  props: {
    backgroundColor: LAY.color("gainsboro")
  },
  "Container": {
    props: {
      centerX: LAY.take("../", "$midpointX"),
      centerY: LAY.take("../", "$midpointY"),
      backgroundColor: LAY.color("pink")
    },
    transition: {
      all: {
        type: "linear",
        duration: 200
      }
    },
    "Person": {
      props: {
        width: 180,
        cursor: "default",
        border: {style:"solid",
         color: LAY.color("red"),
         width:1
      },
        backgroundColor: LAY.color("blue"),
        text: LAY.take("", "row.content"),
        textSize:20,
        textPadding: 10,
        textColor: LAY.color("white")
      },
      when: {
        click: function () {
          this.many().data("sidebiz",
            !this.many().attr("data.sidebiz") )
          }
      },
      transition: {
        all: {
          type: "linear",
          duration: 200
        }
      },
      states: {
        "hover": {
          onlyif: LAY.take("","$hovering"),
          props: {
            textColor: LAY.color("grey")

          }
        }
      },
      many: {
        data: {
          asc: true,
          sidebiz: false
        },
        formation: "onebelow",            
        sort: [{key: "content",
          ascending: LAY.take("", "data.asc")}],
        rows: [
          {id:1, content: "Airbus" },
          {id:2, content: "Boeing" },
          {id:3, content: "NASA" },
          {id:4, content: "Zeil" }
        ],
        states: {
          "sidebiz": {
            onlyif: LAY.take("", "data.sidebiz"),
            formation: "totheright",
            fargs: {
              totheright: {gap:10}
            }
          }
        }
      }
    } 
  }
});



/*
LAY.run({
  props: {
    backgroundColor: LAY.color("pink")
  },
  
  "First": {
    props: {
      centerX: LAY.take("../", "$midpointX"),
      centerY: LAY.take("../", "$midpointY"),

      width:100,
      height:100,
     border: {
        style: "solid",
        width:1,
        color:LAY.color("green")
      }
    }
  },
 "Second": {
    $inherit: ["../First"],
    props: {
      top: LAY.take("../First", "bottom")
    }
  }
});
*/


if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

function updateLocalStorage () {
  var rows = LAY.level("/App/Container/Todos/Todo").attr("rows");
  if ( window.localStorage && window.JSON ) {
    window.localStorage.setItem("todos", JSON.stringify(rows));
  }
}











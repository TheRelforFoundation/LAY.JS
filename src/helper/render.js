( function () {
  "use strict";


  /*
  * Optional argument of `timeNow`
  * which represent the previous time frame
  */
  LAID.$render = function ( timeNow ) {
    if ( !LAID.$isRequestedForAnimationFrame && ( LAID.$renderDirtyLevelS.length !== 0 ) ) {
      LAID.$prevTimeFrame = timeNow || performance.now();
      window.requestAnimationFrame( render );
    }
  }

  function render() {

    var
      newPartS = LAID.$newPartS, newPart, newPartLevel,
      curTimeFrame = performance.now(),
      timeFrameDiff = curTimeFrame - LAID.$prevTimeFrame,
      x, y,
      i, len,
      renderDirtyLevelS = LAID.$renderDirtyLevelS,
      renderDirtyLevel,
      renderDirtyAttrValueS,
      renderDirtyAttrValue,
      renderDirtyTransition,
      renderCallS, isAttrTransitionComplete;

    console.log( "render" );

    for ( i = 0, len = newPartS.length; i < len; i++ ) {
      newPart = newPartS[ i ];
      newPartLevel = newPart.level;
      if ( newPartLevel.path !== "/" ) {
        newPartLevel.parentLevel.part.node.appendChild( newPart.node );
      }
      if ( newPartLevel.$lson.load ) {
        newPartLevel.$lson.load.call( newPartLevel );
      }
    }

    LAID.$newPartS = [];

    for ( x = 0; x < renderDirtyLevelS.length; x++ ) {

      renderDirtyLevel = renderDirtyLevelS[ x ];
      renderDirtyAttrValueS = renderDirtyLevel.$renderDirtyAttrValueS;
      renderCallS = [];

      for ( y = 0; y < renderDirtyAttrValueS.length; y++ ) {

        isAttrTransitionComplete = true;
        renderDirtyAttrValue = renderDirtyAttrValueS[ y ];
        LAID.$arrayUtils.pushUnique( renderCallS, renderDirtyAttrValue.renderCall );
        renderDirtyTransition = renderDirtyAttrValue.transition;

        if ( renderDirtyTransition !== undefined ) { // if transitioning

          if ( renderDirtyTransition.delay && renderDirtyTransition.delay > 0 ) {
            renderDirtyTransition.delay -= timeFrameDiff ;
          } else {
            if ( !renderDirtyTransition.checkIsComplete() ) {
              isAttrTransitionComplete = false;
              renderDirtyAttrValue.transitionCalcValue =
                renderDirtyTransition.startCalcValue +
                ( renderDirtyTransition.generateNext( timeFrameDiff ) *
                  ( renderDirtyAttrValue.calcValue -
                     renderDirtyTransition.startCalcValue )
                );

            } else {
              if ( renderDirtyTransition.done !== undefined ) {
                renderDirtyTransition.done.call( renderDirtyLevel );
              }
              renderDirtyAttrValue.transition = undefined;
            }
          }

        }

        if ( isAttrTransitionComplete ) {

          renderDirtyAttrValue.transitionCalcValue =
            renderDirtyAttrValue.calcValue;
          LAID.$arrayUtils.removeAtIndex( renderDirtyAttrValueS, y );
          y--;

        }

      }

      // If "text" is to be rendered, it must be
      // rendered last to be able to bear knowledge
      // of the most recent (render) changes to text props
      // such as text padding, text size, and other text props
      // which can affect the dimensions of the part
      if ( LAID.$arrayUtils.remove( renderCallS, "text" ) ) {
        renderCallS.push( "text" );
      }

      for ( i = 0, len = renderCallS.length; i < len; i++ ) {
        //console.log("$renderFn_" + renderCallS[ i ]);
        renderDirtyLevel.part[ "$renderFn_" + renderCallS[ i ] ]();
      }

      if ( renderDirtyAttrValueS.length === 0 ) {
        LAID.$arrayUtils.removeAtIndex( renderDirtyLevelS, x );
        x--;
      }
    }

    LAID.$isRequestedForAnimationFrame = false;

    LAID.$render( curTimeFrame );


  }


})();
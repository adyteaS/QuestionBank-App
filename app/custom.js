/*$('.button-collapse').sideNav({
      menuWidth: 300, // Default is 240
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    }
  );*/
// Show sideNav
//$('.button-collapse').sideNav('show');
/*
 $(".button-collapse").sideNav();
*/
     $( document ).ready(function() {
      $(".button-collapse").sideNav();
    });

       $(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal();
  });


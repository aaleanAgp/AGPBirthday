(function($) {
	var pagify = {
		items: {},
		container: null,
		totalPages: 1,
		perPage: 3,
		currentPage: 0,
		createNavigation: function() {
			this.totalPages = Math.ceil(this.items.length / this.perPage);

			$('.paginations', this.container.parent()).remove();
			var pagination = $('<div class="paginations"></div>').append('<a class="qnav prev" data-next="false"><</a>');

			for (var i = 0; i < this.totalPages; i++) {
				var pageElClass = "page";
				if (!i)
					pageElClass = "page current";
				var pageEl = '<a class="' + pageElClass + '" data-page="' + (
				i + 1) + '">' + (
				i + 1) + "</a>";
				pagination.append(pageEl);
			}
			pagination.append('<a class="qnav next" data-next="true">></a>');

			this.container.after(pagination);

			var that = this;
			$("body").off("click", ".qnav");
			this.navigator = $("body").on("click", ".qnav", function() {
				var el = $(this);
				that.navigate(el.data("next"));
			});

			$("body").off("click", ".page");
			this.pageNavigator = $("body").on("click", ".page", function() {
				var el = $(this);
				that.goToPage(el.data("page"));
			});
		},
		navigate: function(next) {
			// default perPage to 5
			if (isNaN(next) || next === undefined) {
				next = true;
			}
			//$(".paginations .qnav").removeClass("disabled");
			if (next) {
				this.currentPage++;
				if (this.currentPage >= this.totalPages)
					this.currentPage = 0;
				if (this.currentPage > (this.totalPages - 1))
					this.currentPage = (this.totalPages - 1);
				/*if (this.currentPage == (this.totalPages - 1))
					$(".paginations .qnav.next").addClass("disabled");*/
				}
			else {
				this.currentPage--;
				if (this.currentPage < 0)
					this.currentPage = this.totalPages - 1;
				/*if (this.currentPage == 0)
					$(".paginations .qnav.prev").addClass("disabled");*/
				}

			this.showItems();
		},
		updateNavigation: function() {

			var pages = $(".paginations .page");
			pages.removeClass("current");
			$('.paginations .page[data-page="' + (
			this.currentPage + 1) + '"]').addClass("current");
		},
		goToPage: function(page) {

			this.currentPage = page - 1;

			/*$(".paginations .qnav").removeClass("disabled");
			if (this.currentPage == (this.totalPages - 1))
				$(".paginations .qnav.next").addClass("disabled");

			if (this.currentPage == 0)
				$(".paginations .qnav.prev").addClass("disabled");*/
			this.showItems();
		},
		showItems: function() {
			this.items.hide();
			var base = this.perPage * this.currentPage;
			this.items.slice(base, base + this.perPage).show();

			this.updateNavigation();
		},
		init: function(container, items, perPage) {
			this.container = container;
			this.currentPage = 0;
			this.totalPages = 1;
			this.perPage = perPage;
			this.items = items;
			this.createNavigation();
			this.showItems();
		}
	};

	// stuff it all into a jQuery method!
	$.fn.pagify = function(perPage, itemSelector) {
		var el = $(this);
		var items = $(itemSelector, el);

		// default perPage to 5
		if (isNaN(perPage) || perPage === undefined) {
			perPage = 3;
		}

		// don't fire if fewer items than perPage
		/*if (items.length <= perPage) {
			return true;
		}*/

		pagify.init(el, items, perPage);
	};
})(jQuery);

$("#cumpleanios__list").pagify(9, ".cumpleanios__carousel__item");

/*const element1 = document.querySelector('input[class="datepicker1"]');
const element2 = document.querySelector('input[class="datepicker2"]');

const datepicker1 = new Datepicker(element1, optionsDatePicker);
const datepicker2 = new Datepicker(element2, optionsDatePicker);*/
new DateRangePicker(document.getElementById('foo'), {
	format: 'dd/mm',
	autohide: true,
	minDate: new Date(new Date().getFullYear(), 0, 1),
	maxDate: new Date(new Date().getFullYear(), 11, 31),
}); 








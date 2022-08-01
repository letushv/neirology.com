// Полифилл для попапов
const dialogs = document.getElementsByTagName('dialog');
const dialogBtns = document.querySelectorAll('[aria-haspopup="dialog"]');
for (let i = 0; i < dialogs.length; i++) {
	dialogPolyfill.registerDialog(dialogs[i]);
}
for (let i = 0; i < dialogBtns.length; i++) {
	dialogBtns[i].onclick = function () {
		const dialog = document.getElementById(this.getAttribute('aria-controls'));
		if (dialog) {
			dialog.showModal();
		}
	}
}

// Оживляем просмотр отзывов и дипломов
const expandLinks = document.getElementsByClassName('js-img__expand');
for (let i = 0; i < expandLinks.length; i++) {
	expandLinks[i].addEventListener('click', function (e) {
		e.preventDefault();
		e.currentTarget.setAttribute('aria-expanded', (e.currentTarget.getAttribute('aria-expanded') === 'false'));
	})
}


// Закрепляем шапку
const header = document.querySelector('.header');
const observerHeader = new IntersectionObserver(function (entries) {
	entries[0].isIntersecting ? header.classList.remove('header--sticky') : header.classList.add('header--sticky');
});
observerHeader.observe(document.querySelector('.page__top'));


// Запоминаем скрытый баннер
if (window.localStorage.getItem('hideBanner')) {
	document.querySelector('.page__banner').hidden = true;
}

//Генерируем календари
if (!("scrollBehavior" in document.documentElement.style)) {
	var scrollByFrame = window.requestAnimationFrame || function (callback) {
		window.setTimeout(callback, 1000 / 60)
	};

	function scrollTo(element, to, duration) {
		let start = element.scrollLeft,
			change = to - start,
			currentTime = 0,
			increment = 10;
		let animateScroll = function () {
			currentTime += increment;
			element.scrollLeft = Math.easeInOutQuad(currentTime, start, change, duration);
			if (currentTime < duration) {
				setTimeout(animateScroll, increment);
			}
		};
		scrollByFrame(animateScroll);
	}

	Math.easeInOutQuad = function (t, b, c, d) {
		t /= d / 2;
		if (t < 1) return c / 2 * t * t + b;
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	};
}
let calendars = document.getElementsByClassName('calendar');
for (let i = 0; i < calendars.length; i++) {
	// Парсим окошки в массив datesWithTimes
	let times = calendars[i].dataset.dates.split(',');
	let popup = calendars[i].dataset.popup;
	if (times[0]) {
		let tempDateObj = {};
		let tempDate = '';
		let tempTimeString = '';
		let datesWithTimes = {};
		for (let j = 0; j < times.length; j++) {
			tempDateObj = new Date(times[j]);
			tempDate = tempDateObj.toLocaleDateString();
			tempTimeString = tempDateObj.toLocaleTimeString('ru', {hour: '2-digit', minute: '2-digit'});
			if (!datesWithTimes[tempDate]) {
				datesWithTimes[tempDate] = {};
			}
			datesWithTimes[tempDate][tempTimeString] = times[j];
		}

		// Запоминаем сегодня
		const today = (new Date()).toLocaleDateString();

		// Строим массив months на два месяца вперед от первого окошка
		let tempMonth = '';
		let months = {};
		tempDateObj = new Date(times[0]);
		let lastDate = new Date();
		lastDate.setTime(tempDateObj.getTime());
		lastDate.setMonth(lastDate.getMonth() + 2);
		while (tempDateObj < lastDate) {
			tempMonth = tempDateObj.toLocaleDateString('ru', {month: "long"});
			if (!months[tempMonth]) {
				months[tempMonth] = {};
			}
			months[tempMonth][tempDateObj.toLocaleDateString()] = {
				weekday: tempDateObj.toLocaleDateString('ru', {weekday: "short"}),
				number: tempDateObj.toLocaleDateString('ru', {day: "numeric"})
			};
			tempDateObj.setDate(tempDateObj.getDate() + 1);
		}

		// Создаем DOM-элементы

		// Кнопка назад
		let previousDayBtn = document.createElement('button');
		previousDayBtn.type = 'button';
		previousDayBtn.classList.add('calendar__prev');
		previousDayBtn.setAttribute('aria-label', 'Прошлые даты');
		previousDayBtn.title = 'Прошлые даты';
		previousDayBtn.onclick = function () {
			let days = this.parentElement.querySelector('.calendar__months');
			if (!("scrollBehavior" in document.documentElement.style)) {
				scrollTo(days, days.scrollLeft - days.clientWidth, 300);
			} else {
				days.scrollLeft -= days.clientWidth;
			}
		}
		calendars[i].appendChild(previousDayBtn);

		// Кнопка далее
		let nextDayBtn = document.createElement('button');
		nextDayBtn.type = 'button';
		nextDayBtn.classList.add('calendar__next');
		nextDayBtn.setAttribute('aria-label', 'Следующие даты');
		nextDayBtn.title = 'Следующие даты';
		nextDayBtn.onclick = function () {
			let days = this.parentElement.querySelector('.calendar__months');
			if (!("scrollBehavior" in document.documentElement.style)) {
				scrollTo(days, days.scrollLeft + days.clientWidth, 300);
			} else {
				days.scrollLeft += days.clientWidth;
			}
		}

		// Список месяцев
		let monthWrapper = document.createElement('div');
		monthWrapper.classList.add('calendar__months_wrapper');
		let monthElements = document.createElement('ul');
		monthElements.classList.add('calendar__months');

		for (const month in months) {
			let monthElement = document.createElement('li');

			let monthTitle = document.createElement('b');
			monthTitle.classList.add('calendar__month_title');
			monthTitle.textContent = month;
			monthElement.appendChild(monthTitle);

			// Список дней в месяце
			let days = months[month];
			let daysElement = document.createElement('div');
			daysElement.classList.add('calendar__days');
			for (const day in days) {
				const hasTimes = !!datesWithTimes[day];
				let dayElement = document.createElement(hasTimes ? 'button' : 'span');
				if (hasTimes) {
					dayElement.type = 'button';
					dayElement.value = day;
					dayElement.onclick = function () {
						const calendar = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
						this.scrollIntoView({behavior: "smooth", inline: "nearest", block: "nearest"});
						calendar.querySelector('.calendar__times[aria-expanded=true]').removeAttribute('aria-expanded');
						let fieldsets = calendar.querySelectorAll('.calendar__times');
						for (const fieldset of fieldsets) {
							if (fieldset.hasAttribute('aria-expanded')) {
								fieldset.removeAttribute('aria-expanded');
							}
							if (fieldset.querySelector('legend').textContent === this.value) {
								fieldset.setAttribute('aria-expanded', 'true');
							}
						}
						calendar.querySelector('.calendar__day[aria-current="date"]').removeAttribute('aria-current');
						this.setAttribute('aria-current', 'date');
					}
				}
				dayElement.classList.add('calendar__day');
				if (day === today) {
					dayElement.classList.add('calendar__day--today');
				}

				dayElement.textContent = days[day].weekday + ' ' + days[day].number;

				daysElement.appendChild(dayElement);
			}

			monthElement.appendChild(daysElement);
			monthElements.appendChild(monthElement);
		}
		monthElements.querySelector('button.calendar__day').setAttribute('aria-current', 'date');
		monthWrapper.appendChild(monthElements);
		calendars[i].appendChild(monthWrapper);
		calendars[i].appendChild(nextDayBtn);

		// Список окошек
		for (const dateWithTimes in datesWithTimes) {
			let timesElement = document.createElement('fieldset');
			timesElement.classList.add('calendar__times');
			let timesLegend = document.createElement('legend');
			timesLegend.textContent = dateWithTimes;
			timesElement.appendChild(timesLegend);

			const times = datesWithTimes[dateWithTimes];
			for (const time in times) {
				if (popup) {
					let timeBtn = document.createElement('button');
					timeBtn.type = 'button';
					timeBtn.textContent = time;
					timeBtn.setAttribute('aria-haspopup', 'dialog');
					timeBtn.setAttribute('aria-controls', popup);
					timeBtn.value = times[time];
					timeBtn.classList.add('calendar__time');
					timeBtn.onclick = function () {
						const dialog = document.getElementById(this.getAttribute('aria-controls'));
						const selectedDate = this.parentElement.querySelector('legend').textContent;
						if (dialog) {
							dialog.querySelector('.calendar__day[aria-current="date"]').removeAttribute('aria-current');
							dialog.querySelector('.calendar__times[aria-expanded=true]').removeAttribute('aria-expanded');
							const legends = dialog.querySelectorAll('.calendar legend');
							for (let j = 0; j < legends.length; j++) {
								if (legends[j].textContent === selectedDate) {
									legends[j].parentElement.setAttribute('aria-expanded', 'true');
									const radios = legends[j].parentElement.querySelectorAll('input');
									for (let k = 0; k < radios.length; k++) {
										if (radios[k].value === this.value) {
											radios[k].checked = true;
											break;
										}
									}
									break;
								}
							}
							const dayBtns = dialog.querySelectorAll('.calendar__day');
							for (let j = 0; j < dayBtns.length; j++) {
								if (dayBtns[j].value === selectedDate) {
									dayBtns[j].setAttribute('aria-current', 'date');
									break;
								}
							}
							dialog.showModal();
							dialog.querySelector('.calendar__months').scrollLeft = this.parentElement.parentElement.querySelector('.calendar__months').scrollLeft;
						}
					}
					timesElement.appendChild(timeBtn);
				} else {
					let timeRadio = document.createElement('input');
					timeRadio.type = 'radio';
					timeRadio.name = 'time';
					timeRadio.value = times[time];
					timeRadio.classList.add('invisible');

					let timeLabel = document.createElement('span');
					timeLabel.textContent = time;

					let timeWrapper = document.createElement('label');
					timeWrapper.classList.add('calendar__time_wrapper');
					timeWrapper.appendChild(timeRadio);
					timeWrapper.appendChild(timeLabel);

					timesElement.appendChild(timeWrapper);
				}
			}

			calendars[i].appendChild(timesElement);
		}
		calendars[i].querySelector('.calendar__times').setAttribute('aria-expanded', 'true');
	} else {
		//Если окошек нет.
		calendars[i].textContent = 'Нет доступных окошек для записи.';
	}
}
//Отключаем кнопки календаря в крайних положениях
if (calendars) {
	const observerPrevs = new IntersectionObserver(function (entries) {
		entries.forEach(entry => {
			entry.target.parentElement.parentElement.parentElement.parentElement.previousElementSibling.disabled = entry.isIntersecting;
		});
	});
	const firstDays = document.querySelectorAll(".calendar__months > li:first-child .calendar__day:first-child");
	firstDays.forEach(function (target) {
		observerPrevs.observe(target);
	});
	const observerNexts = new IntersectionObserver(function (entries) {
		entries.forEach(entry => {
			entry.target.parentElement.parentElement.parentElement.parentElement.nextElementSibling.disabled = entry.isIntersecting;
		});
	});
	const lastDays = document.querySelectorAll(".calendar__months > li:last-child .calendar__day:last-child");
	lastDays.forEach(function (target) {
		observerNexts.observe(target);
	});
}

//Отображение кол-ва выбранных фильтров
let filterCloseBtns = document.getElementsByClassName('js-filter__close');
for (let i = 0; i < filterCloseBtns.length; i++) {
	filterCloseBtns[i].addEventListener('click', function (e) {
		const dialog = document.getElementById(e.target.getAttribute('aria-controls'));
		const dialogInputs = dialog.querySelectorAll('input');
		let filterCounter = 0;
		for (let j = 0; j < dialogInputs.length; j++) {
			if (dialogInputs[j].checked) {
				filterCounter++;
			}
		}
		document.querySelector('.filter__btn[aria-controls="' + dialog.id + '"] .filter__btn_counter').innerText = filterCounter > 0 ? filterCounter : '';
		dialog.close();
	})
}


// Оживляем кнопки Выбрать всё внутри фильтров
const checkboxLists = document.getElementsByClassName('filter__fieldset--checkboxes');
for (let i = 0; i < checkboxLists.length; i++) {
	let toggleAllBtn = checkboxLists[i].querySelector('.filter__all');
	if (toggleAllBtn) {
		checkboxLists[i].addEventListener('change', function (e) {
			let toggleAllBtn = e.currentTarget.querySelector('.filter__all');
			let checkboxes = e.currentTarget.querySelectorAll('.filter__checkbox');
			for (let j = 0; j < checkboxes.length; j++) {
				if (checkboxes[j].checked === true) {
					toggleAllBtn.innerText = 'Очистить';
					return;
				}
			}
			toggleAllBtn.innerText = 'Выбрать всё';
		});
		toggleAllBtn.addEventListener('click', function (e) {
			let checkboxes = e.currentTarget.parentElement.querySelectorAll('.filter__checkbox');
			if (e.currentTarget.innerText === 'Выбрать всё') {
				for (let j = 0; j < checkboxes.length; j++) {
					checkboxes[j].checked = true;
				}
				e.currentTarget.innerText = 'Очистить';
			} else {
				for (let j = 0; j < checkboxes.length; j++) {
					checkboxes[j].checked = false;
				}
				e.currentTarget.innerText = 'Выбрать всё';
			}
		});
	}
}

// Оживляем кнопки Читать полностью
const expandBtns = document.getElementsByClassName('feedback__expand');
for (let i = 0; i < expandBtns.length; i++) {
	expandBtns[i].addEventListener('click', function (e) {
		e.currentTarget.hidden = true;
		e.currentTarget.parentElement.querySelector('.feedback__offline_text--collapsed').classList.remove('feedback__offline_text--collapsed');
	})
}

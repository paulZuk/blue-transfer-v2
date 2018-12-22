
(function ($) {
    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            let target = $(this.hash);
            target = target.length ? target : $(`[name=${this.hash.slice(1)}]`);
            if (target.length) {
                $('html, body').animate({
                    scrollTop: (target.offset().top - 48),
                }, 1000, 'easeInOutExpo');
                return false;
            }
        }
    });
    // Move background function

    const header = $('header');
    const headerHeight = header.outerHeight();

    function moveBackground(elem, factor, from, to) {
        const scrollTop = $(window).scrollTop();
        let calc;

        if (scrollTop >= to) {
            calc = (to - from) / factor;
        }

        if (scrollTop >= from) {
            calc = ((scrollTop - from) / factor);
        }

        elem.css({ 'background-position': `center ${calc}px` });
    }

    $(window).on('scroll', () => {
        moveBackground(header, 3, 0, headerHeight);
    });


    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(() => {
        $('.navbar-collapse').collapse('hide');
    });

    // Activate scrollspy to add active class to navbar items on scroll
    $('body').scrollspy({
        target: '#mainNav',
        offset: 54,
    });

    // Collapse Navbar
    const navbarCollapse = function () {
        if ($('#mainNav').offset().top > 100) {
            $('#mainNav').addClass('navbar-shrink');
        } else {
            $('#mainNav').removeClass('navbar-shrink');
        }
    };
    // Collapse now if page is not at top
    navbarCollapse();
    // Collapse the navbar when page is scrolled
    $(window).scroll(navbarCollapse);

    // Media player

    // MEDIA PLAYER
    class MediaPlayer {
        constructor(container) {
            this.container = document.getElementById(container);
            this.player = this.container.querySelector('.player');
            this.duration = this.player.duration || null;
            this.playButton = this.container.querySelector('.play');
            this.playHead = this.container.querySelector('.playhead');
            this.timeline = this.container.querySelector('.timeline');
            this.timelineWidth = this.timeline.offsetWidth - this.playHead.offsetWidth;
            this.onplayhead = false;
            this.nextButton = this.container.querySelector('.next');
            this.prevButton = this.container.querySelector('.prev');
            this.playlist = this.container.querySelector('.playlist');
            this.listItems = this.playlist.querySelectorAll('li');
            this.playingTitle = document.querySelector('.now-playing__title').querySelector('p');
            this.source = document.getElementById('source');

            this.setEventListeners = this.setEventListeners.bind(this);
            this.play = this.play.bind(this);
            this.updateTime = this.updateTime.bind(this);
            this.getAudioDuration = this.getAudioDuration.bind(this);
            this.movePlayhead = this.movePlayhead.bind(this);
            this.clickPercent = this.clickPercent.bind(this);
            this.clickTimeline = this.clickTimeline.bind(this);
            this.mouseDown = this.mouseDown.bind(this);
            this.mouseUp = this.mouseUp.bind(this);
            this.playNext = this.playNext.bind(this);
            this.playPrev = this.playPrev.bind(this);
            this.selectFromList = this.selectFromList.bind(this);

            this.setEventListeners();
        }
        setEventListeners() {
            this.playButton.addEventListener('click', this.play);
            this.player.addEventListener('timeupdate', this.updateTime, false);
            this.player.addEventListener('canplaythrough', this.getAudioDuration, false);
            this.timeline.addEventListener('click', this.clickTimeline, false);
            this.playHead.addEventListener('mousedown', this.mouseDown, false);
            this.nextButton.addEventListener('click', this.playNext, false);
            this.prevButton.addEventListener('click', this.playPrev, false);
            this.playlist.addEventListener('click', this.selectFromList, false);

            window.addEventListener('mouseup', this.mouseUp, false);
        }
        play() {
            if (this.player.paused) {
                this.player.play();
                this.playButton.className = '';
                this.playButton.className = 'pause';
            } else {
                this.player.pause();
                this.playButton.className = '';
                this.playButton.className = 'play';
            }
        }
        updateTime() {
            const playPercent = this.timelineWidth * (this.player.currentTime / this.duration);
            this.playHead.style.marginLeft = `${playPercent}px`;
            if (this.player.currentTime === this.duration) {
                this.playButton.className = '';
                this.playButton.className = 'play';
            }
        }
        getAudioDuration() {
            this.duration = this.player.duration;
        }
        movePlayhead(e) {
            const newMargLeft = e.clientX - MediaPlayer.getPosition(this.timeline);

            if (newMargLeft >= 0 && newMargLeft <= this.timelineWidth) {
                this.playHead.style.marginLeft = `${newMargLeft}px`;
            }
            if (newMargLeft < 0) {
                this.playHead.style.marginLeft = '0px';
            }
            if (newMargLeft > this.timelineWidth) {
                this.playHead.style.marginLeft = `${this.timelineWidth}px`;
            }
        }
        static getPosition(element) {
            return element.getBoundingClientRect().left;
        }
        clickPercent(e) {
            return (e.clientX - MediaPlayer.getPosition(this.timeline)) / this.timelineWidth;
        }
        clickTimeline(e) {
            this.movePlayhead(e);
            this.player.currentTime = this.duration * this.clickPercent(e);
        }
        mouseDown() {
            this.onplayhead = true;
            window.addEventListener('mousemove', this.movePlayhead, true);
            this.player.removeEventListener('timeupdate', this.updateTime, false);
        }
        mouseUp(e) {
            if (this.onplayhead === true) {
                this.movePlayhead(e);
                window.removeEventListener('mousemove', this.movePlayhead, true);
                this.player.currentTime = this.duration * this.clickPercent(e);
                this.player.addEventListener('timeupdate', this.updateTime, false);
            }
            this.onplayhead = false;
        }
        playNext() {
            for (let i = 0; i < this.listItems.length; i++) {
                if (this.listItems[i].classList.contains('active')
                    && typeof this.listItems[i + 1] !== 'undefined') {
                    MediaPlayer.clearActive(this.listItems);
                    this.loadAndPlay(Number(this.listItems[i].id) + 1);
                    return;
                }
            }
        }
        playPrev() {
            for (let i = 0; i < this.listItems.length; i++) {
                if (this.listItems[i].classList.contains('active')
                    && typeof this.listItems[i - 1] !== 'undefined') {
                    MediaPlayer.clearActive(this.listItems);
                    this.loadAndPlay(Number(this.listItems[i - 1].id));
                    return;
                }
            }
        }
        static clearActive(items) {
            items.forEach((item) => {
                item.classList.remove('active');
            });
        }
        selectFromList(e) {
            MediaPlayer.clearActive(this.listItems);
            this.loadAndPlay(e.target.parentElement.id);
        }
        loadAndPlay(trackId) {
            const track = document.getElementById(trackId);
            const trackName = track.querySelector('.title');

            this.source.setAttribute('src', `music/${track.dataset.filename}`);
            track.classList.add('active');

            this.playingTitle.innerText = trackName.innerText;

            this.playButton.className = '';
            this.playButton.className = 'pause';
            this.player.load();
            this.player.play();
        }
    }
    const media = new MediaPlayer('media-player');

    // Close edit
    const prepareData = () => {
        const data = {};
        const elements = $('[data-title]').toArray();
        elements.forEach((elem) => {
            data[elem.getAttribute('data-title')] = elem.innerHTML;
        });
        return data;
    };
    const postData = () => {
        const data = prepareData();
        $.ajax({
            url: 'cms.php',
            data,
            type: 'post',
        });
    };
    const updateHtml = (data) => {
        const elements = $('[data-title]').toArray();
        elements.forEach((elem) => {
            const name = elem.getAttribute('data-title');
            // eslint-disable-next-line no-param-reassign
            elem.innerHTML = data[name];
        });
    };
    const getData = () => {
        $.get('cms.json', (data) => {
            updateHtml(data);
        });
    };
    const setEditable = () => {
        const password = prompt('Hasło');
        if (password === 'test') {
            $('[data-title]').attr('contenteditable', true);
            $('.cms-bar').addClass('visible');
            $('#logo').off('dblclick');
            return;
        }
        alert('Podano złe hasło!!!');
    };

    $(() => {
        getData();
    });

    const closeEdit = () => {
        $('[data-title]').removeAttr('contenteditable');
        $('.cms-bar').removeClass('visible');
        $('#logo').on('dblclick', () => {
            setEditable();
        });
    };

    $('#closeEdit').on('click', () => {
        closeEdit();
        postData();
    });

    $('#logo').on('dblclick', () => {
        setEditable();
    });
}(jQuery)); // End of use strict


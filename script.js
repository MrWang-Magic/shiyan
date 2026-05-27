// ===== 开场动画控制 =====
(function() {
    const splashScreen = document.getElementById('splash-screen');
    const splashLogo = document.getElementById('splash-logo');
    if (!splashScreen || !splashLogo) return;
    
    if (sessionStorage.getItem('splashPlayed')) {
        splashScreen.style.display = 'none';
        splashScreen.remove();
        return;
    }
    
    sessionStorage.setItem('splashPlayed', 'true');
    
    const headerLogo = document.querySelector('.logo span');
    if (headerLogo) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const headerRect = headerLogo.getBoundingClientRect();
                const splashRect = splashLogo.getBoundingClientRect();
                const headerFontSize = parseFloat(window.getComputedStyle(headerLogo).fontSize);
                const splashFontSize = parseFloat(window.getComputedStyle(splashLogo).fontSize);
                const endScale = headerFontSize / splashFontSize;
                
                const finalX = (headerRect.left + headerRect.width / 2) - (splashRect.left + splashRect.width / 2);
                const finalY = (headerRect.top + headerRect.height / 2) - (splashRect.top + splashRect.height / 2);
                
                splashLogo.animate([
                    { transform: 'translate(0, 0) scale(0)', opacity: 0 },
                    { transform: 'translate(0, 0) scale(1.1)', opacity: 1, offset: 0.25 },
                    { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.35 },
                    { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.40 },
                    { transform: `translate(${finalX}px, ${finalY}px) scale(${endScale})`, opacity: 1, offset: 0.75 },
                    { transform: `translate(${finalX}px, ${finalY}px) scale(${endScale})`, opacity: 1, offset: 1 }
                ], {
                    duration: 3000,
                    easing: 'ease-in-out',
                    fill: 'forwards'
                });
                
                splashScreen.animate([
                    { opacity: 1 },
                    { opacity: 1, offset: 0.40 },
                    { opacity: 0, offset: 0.75 },
                    { opacity: 0, offset: 1 }
                ], {
                    duration: 3000,
                    easing: 'linear',
                    fill: 'forwards'
                });
            });
        });
    } else {
        splashScreen.animate([
            { opacity: 1 },
            { opacity: 1, offset: 0.35 },
            { opacity: 0, offset: 0.75 },
            { opacity: 0, offset: 1 }
        ], {
            duration: 3000,
            easing: 'linear',
            fill: 'forwards'
        });
        
        splashLogo.animate([
            { transform: 'translate(0, 0) scale(0)', opacity: 0 },
            { transform: 'translate(0, 0) scale(1.1)', opacity: 1, offset: 0.25 },
            { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.35 },
            { transform: 'translate(0, 0) scale(0.6)', opacity: 1, offset: 0.75 },
            { transform: 'translate(0, 0) scale(0.6)', opacity: 1, offset: 1 }
        ], {
            duration: 3000,
            easing: 'ease-in-out',
            fill: 'forwards'
        });
    }
    
    setTimeout(() => {
        splashScreen.remove();
    }, 3200);
})();

// ===== 图片防下载 =====
(function() {
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.preventDefault();
            return false;
        }
    });
})();

const categoryData = {
    'smart-city': {
        subcategories: [
            { name: '数字孪生平台', id: 'digital-twin' },
            { name: '时空大数据', id: 'spatio-temporal' },
            { name: '信息化平台', id: 'information' }
        ]
    },
    'ai-product': {
        subcategories: [
            { name: 'AI+政务系统应用', id: 'ai-government' },
            { name: 'AI数智化产品手册', id: 'ai-handbook' },
            { name: 'AI+场景设计', id: 'ai-scene-design' }
        ]
    },
    'low-altitude': {
        subcategories: [{ name: '空域规划和管控', id: '空域规划和管控' }]
    },
    'space-design': {
        subcategories: [
            { name: '战略蓝图', id: '战略蓝图' },
            { name: '场景营造', id: '场景营造' },
            { name: '技术咨询', id: '技术咨询' },
            { name: '法定规划', id: '法定规划' }
        ]
    }
};

let activeSubcategory = null;

// 检测是否是移动设备
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

// 检测是否是平板或移动设备（用于滑动指示器等UI元素）
function isTabletOrMobile() {
    return isMobile() || window.innerWidth < 1024;
}

const categoryItems = document.querySelectorAll('.category-item');
const subCategoriesContainer = document.getElementById('subCategories');
const worksSection = document.getElementById('worksSection');
let currentGallery = null;
let closeButton = null;
let galleryHeight = 0;
let leftArrow = null;
let rightArrow = null;

function switchCategory(categoryId) {
    categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === categoryId) {
            item.classList.add('active');
        }
    });

    updateSubCategories(categoryId);
    updateWorks(categoryId);
}

function updateSubCategories(categoryId) {
    const category = categoryData[categoryId];
    if (!category) return;

    subCategoriesContainer.innerHTML = '';
    activeSubcategory = null;

    const subcategories = category.subcategories;

    subcategories.forEach((sub, index) => {
        const li = document.createElement('li');
        li.className = 'sub-item';
        li.textContent = typeof sub === 'object' ? sub.name : sub;
        li.dataset.subcategoryId = typeof sub === 'object' ? sub.id : null;
        initSubcategoryClick(li);
        subCategoriesContainer.appendChild(li);
    });
}

function filterWorksBySubcategory(categoryId, subcategoryId) {
    const workItems = worksSection.querySelectorAll('.work-item');

    workItems.forEach(item => {
        if (item.dataset.category === categoryId) {
            if (item.dataset.subcategory === subcategoryId) {
                item.style.display = 'flex';
                item.style.animation = 'none';
                item.offsetHeight;
                item.style.animation = 'fadeIn 0.5s ease forwards';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

function updateWorks(categoryId) {
    const workItems = worksSection.querySelectorAll('.work-item');

    workItems.forEach(item => {
        if (item.dataset.category === categoryId) {
            item.style.display = 'flex';
            item.style.animation = 'none';
            item.offsetHeight;
            item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
            item.style.display = 'none';
        }
    });
}

function openGallery(workItem) {
    // 首先强制清理所有可能存在的画廊，确保安全
    if (currentGallery) {
        performCloseGallery(
            currentGallery.workItem, 
            currentGallery.container, 
            currentGallery.infoHeight, 
            currentGallery.fixedImageHeight
        );
    }
    
    // 清理所有可能残留的展开状态
    const allWorkItems = worksSection.querySelectorAll('.work-item');
    allWorkItems.forEach(item => {
        item.classList.remove('expanded');
        const existingGallery = item.querySelector('.gallery-container');
        if (existingGallery) {
            existingGallery.remove();
        }
        const existingImageWrapper = item.querySelector('.work-image-wrapper');
        if (existingImageWrapper) {
            existingImageWrapper.style.display = '';
        }
        item.style.transform = '';
        item.style.opacity = '';
    });
    
    // 清理残留的箭头
    if (leftArrow) {
        leftArrow.remove();
        leftArrow = null;
    }
    if (rightArrow) {
        rightArrow.remove();
        rightArrow = null;
    }
    
    // 如果已经是展开状态，不重复处理
    if (workItem.classList.contains('expanded')) {
        return;
    }

    const imageWrapper = workItem.querySelector('.work-image-wrapper');
    const images = JSON.parse(imageWrapper.dataset.images);
    const workImage = workItem.querySelector('.work-image');
    const workInfo = workItem.querySelector('.work-info');

    // 获取原始图片的尺寸和位置
    const imageRect = workImage.getBoundingClientRect();
    const originalWidth = imageRect.width;
    const originalHeight = workImage.naturalHeight * (originalWidth / workImage.naturalWidth);
    const infoHeight = workInfo ? workInfo.offsetHeight + 10 : 0; // 10px is margin-bottom
    const workItemRect = workItem.getBoundingClientRect();
    const worksSectionRect = worksSection.getBoundingClientRect();

    // 使用固定的图片高度（CSS中定义的400px）加上底部padding（20px）
    const fixedImageHeight = 400;
    const bottomPadding = 20;
    galleryHeight = infoHeight + fixedImageHeight + bottomPadding;

    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'gallery-container';

    // 移动端和网页端使用不同的布局
    if (isTabletOrMobile()) {
        // 移动端：封面不动，gallery在封面下方横向展开
        galleryContainer.style.position = 'relative';
        galleryContainer.style.top = '0';
        galleryContainer.style.left = '0';
        galleryContainer.style.width = '100%';
        galleryContainer.style.height = 'auto';
    } else {
        // 网页端：gallery覆盖在封面上
        galleryContainer.style.position = 'absolute';
        galleryContainer.style.top = `${infoHeight}px`;
        galleryContainer.style.left = `${worksSectionRect.left - workItemRect.left}px`;
        galleryContainer.style.width = `${worksSectionRect.width}px`;
    }

    galleryContainer.style.display = 'flex';
    galleryContainer.style.overflowX = 'auto';
    galleryContainer.style.scrollBehavior = 'smooth';
    galleryContainer.style.zIndex = '999';
    galleryContainer.style.paddingLeft = '0';
    galleryContainer.style.transition = 'height 0s ease';

    let currentPlayingVideo = null;
    const firstItemIsVideo = images.length > 0 && images[0].match(/\.(mp4|webm|ogg|mov)$/i);
    const coverHeight = workImage.offsetHeight;

    images.forEach((src, index) => {
        const isVideo = src.match(/\.(mp4|webm|ogg|mov)$/i);
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = src;
            video.className = 'gallery-image';
            video.alt = 'Gallery video ' + (index + 1);
            video.controls = true;
            video.loop = false;
            video.muted = true;
            video.playsInline = true;
            video.preload = 'auto';
            
            // 移动端设置与封面相同高度
            if (isTabletOrMobile()) {
                video.style.height = `${coverHeight}px`;
                video.style.width = 'auto';
                video.style.maxHeight = 'none';
            }
            
            video.addEventListener('play', () => {
                if (currentPlayingVideo && currentPlayingVideo !== video) {
                    currentPlayingVideo.pause();
                }
                currentPlayingVideo = video;
            });
            
            video.addEventListener('pause', () => {
                if (currentPlayingVideo === video) {
                    currentPlayingVideo = null;
                }
            });
            
            video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.pause();
                if (currentPlayingVideo === video) {
                    currentPlayingVideo = null;
                }
            });
            
            if (index === 0) {
                video.style.cursor = 'pointer';
            }
            galleryContainer.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.className = 'gallery-image';
            img.alt = 'Gallery image ' + (index + 1);
            
            // 移动端设置与封面相同高度
            if (isTabletOrMobile()) {
                img.style.height = `${coverHeight}px`;
                img.style.width = 'auto';
                img.style.maxHeight = 'none';
            }
            
            if (index === 0 && !firstItemIsVideo) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    closeGallery();
                });
            } else if (index === 1 && firstItemIsVideo) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    closeGallery();
                });
            }
            galleryContainer.appendChild(img);
        }
    });

    workItem.appendChild(galleryContainer);
    workItem.classList.add('expanded');
    // 移动端：高度自适应；网页端：固定高度
    if (isTabletOrMobile()) {
        workItem.style.height = 'auto';
    } else {
        workItem.style.height = `${galleryHeight}px`;
    }
    workItem.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    currentGallery = { workItem, container: galleryContainer, infoHeight, fixedImageHeight };

    // 如果第一个项目是视频，自动播放
    if (firstItemIsVideo) {
        const firstVideo = galleryContainer.querySelector('video');
        if (firstVideo) {
            firstVideo.muted = true;
            firstVideo.play().catch(() => {});
        }
    }

    // 淡化其他项目
    const workItems = Array.from(worksSection.querySelectorAll('.work-item'));
    workItems.forEach(item => {
        if (item !== workItem) {
            item.style.opacity = '0.6';
        }
    });

    // 将后续的work-item向下移动
    const currentIndex = workItems.indexOf(workItem);
    const moveDistance = fixedImageHeight + 50; // fixed height + original gap
    workItems.forEach((item, index) => {
        if (index > currentIndex) {
            item.style.transform = `translateY(${moveDistance}px)`;
        }
    });

    // 创建关闭按钮
    if (!closeButton) {
        closeButton = document.createElement('button');
        closeButton.className = 'close-gallery';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', closeGallery);
        document.body.appendChild(closeButton);
    }
    closeButton.classList.add('active');

    // 移动端不创建箭头，网页端创建左右箭头
    if (!isTabletOrMobile()) {
        createNavigationArrows(galleryContainer, workItem);
    }

    // 添加键盘事件（仅网页端）
    if (!isTabletOrMobile()) {
        document.addEventListener('keydown', handleKeyDown);
    }

    // 移动端：gallery覆盖在封面位置，包含所有图片（包括封面），可以左右滑动
    // 网页端：保留原有逻辑
    if (isTabletOrMobile()) {
        imageWrapper.style.display = 'none'; // 隐藏原封面图
        galleryContainer.style.position = 'relative';
        galleryContainer.style.top = '0';
        galleryContainer.style.left = '0';
        galleryContainer.style.width = '100%';
        galleryContainer.style.height = 'auto';
        // 创建滑动指示器
        createScrollIndicator(galleryContainer, workItem);
    } else {
        imageWrapper.style.display = 'none';
    }

    // 确保work-info保持可见
    if (workInfo) {
        workInfo.style.display = 'flex';
    }
}

// 移动端滑动指示器
let scrollIndicator = null;

function createScrollIndicator(container, workItem) {
    const indicatorTrack = document.createElement('div');
    indicatorTrack.className = 'scroll-indicator-track';
    
    const indicatorThumb = document.createElement('div');
    indicatorThumb.className = 'scroll-indicator-thumb';
    indicatorTrack.appendChild(indicatorThumb);
    
    workItem.appendChild(indicatorTrack);
    scrollIndicator = indicatorThumb;
    
    const updateIndicator = () => {
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth - container.clientWidth;
        if (scrollWidth <= 0) {
            indicatorThumb.style.width = '0';
            return;
        }
        const trackWidth = indicatorTrack.clientWidth;
        const thumbWidth = Math.max(trackWidth * (container.clientWidth / container.scrollWidth), 20);
        const thumbLeft = (scrollLeft / scrollWidth) * (trackWidth - thumbWidth);
        indicatorThumb.style.width = `${thumbWidth}px`;
        indicatorThumb.style.transform = `translateX(${thumbLeft}px)`;
    };
    
    container.addEventListener('scroll', updateIndicator);
    setTimeout(updateIndicator, 100);
    indicatorTrack.addEventListener('click', (e) => {
        const trackRect = indicatorTrack.getBoundingClientRect();
        const clickX = e.clientX - trackRect.left;
        const ratio = clickX / trackRect.width;
        container.scrollLeft = ratio * (container.scrollWidth - container.clientWidth);
    });
}

function createNavigationArrows(container, workItem) {
    // 获取section的位置信息
    const worksSectionRect = worksSection.getBoundingClientRect();
    const workItemRect = workItem.getBoundingClientRect();
    const infoHeight = workItem.querySelector('.work-info') ? workItem.querySelector('.work-info').offsetHeight + 10 : 0;
    
    // 左箭头
    leftArrow = document.createElement('div');
    leftArrow.className = 'nav-arrow left-arrow';
    leftArrow.innerHTML = '‹';
    leftArrow.style.position = 'absolute';
    leftArrow.style.top = `${infoHeight + (currentGallery.fixedImageHeight / 2)}px`;
    leftArrow.style.left = `${worksSectionRect.left - workItemRect.left + 10}px`; // 与section左边对齐，留10px间距
    leftArrow.addEventListener('click', () => {
        scrollGallery(-1);
    });
    workItem.appendChild(leftArrow);

    // 右箭头
    rightArrow = document.createElement('div');
    rightArrow.className = 'nav-arrow right-arrow';
    rightArrow.innerHTML = '›';
    rightArrow.style.position = 'absolute';
    rightArrow.style.top = `${infoHeight + (currentGallery.fixedImageHeight / 2)}px`;
    rightArrow.style.right = `${workItemRect.right - worksSectionRect.right + 10}px`; // 与section右边对齐，留10px间距
    rightArrow.addEventListener('click', () => {
        scrollGallery(1);
    });
    workItem.appendChild(rightArrow);

    // hover显示箭头
    container.addEventListener('mouseenter', () => {
        leftArrow.style.opacity = '1';
        rightArrow.style.opacity = '1';
    });
    container.addEventListener('mouseleave', () => {
        leftArrow.style.opacity = '0.3';
        rightArrow.style.opacity = '0.3';
    });
}

function scrollGallery(direction) {
    if (!currentGallery) return;
    const container = currentGallery.container;
    const images = container.querySelectorAll('.gallery-image');
    if (images.length === 0) return;

    const scrollAmount = images[0].offsetWidth + 10;
    container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

function handleKeyDown(e) {
    if (!currentGallery) return;
    
    const container = currentGallery.container;
    const rect = container.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (!isInViewport) return;

    if (e.key === 'ArrowLeft') {
        scrollGallery(-1);
    } else if (e.key === 'ArrowRight') {
        scrollGallery(1);
    }
}

function closeGallery() {
    if (!currentGallery) return;

    const { workItem, container, infoHeight, fixedImageHeight } = currentGallery;
    const isScrolledToStart = container.scrollLeft <= 10;

    if (!isScrolledToStart) {
        container.scrollTo({
            left: 0,
            behavior: 'auto'
        });
    }
    
    // 立即清理所有状态，不使用 setTimeout
    performCloseGallery(workItem, container, infoHeight, fixedImageHeight);
}

function performCloseGallery(workItem, container, infoHeight, fixedImageHeight) {
    const originalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // 停止所有正在播放的视频
    const videos = container.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });

    // 立即清理所有元素和状态
    workItem.style.height = '';
    
    // 移除箭头
    if (leftArrow) {
        leftArrow.remove();
        leftArrow = null;
    }
    if (rightArrow) {
        rightArrow.remove();
        rightArrow = null;
    }

    // 移除滑动指示器
    const indicatorTrack = workItem.querySelector('.scroll-indicator-track');
    if (indicatorTrack) {
        indicatorTrack.remove();
    }
    scrollIndicator = null;

    // 恢复其他项目的状态
    const workItems = Array.from(worksSection.querySelectorAll('.work-item'));
    workItems.forEach(item => {
        item.style.transform = '';
        item.style.opacity = '';
    });

    // 立即移除容器和清理状态
    workItem.classList.remove('expanded');
    container.remove();
    const imageWrapper = workItem.querySelector('.work-image-wrapper');
    if (imageWrapper) {
        imageWrapper.style.display = '';
    }

    // 调整页面滚动位置
    const newScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDifference = newScrollPosition - originalScrollPosition;
    if (scrollDifference > 0) {
        window.scrollBy({
            top: -scrollDifference,
            behavior: 'auto'
        });
    }

    // 立即清理 currentGallery
    currentGallery = null;

    if (closeButton) {
        closeButton.classList.remove('active');
    }

    // 移除键盘事件
    document.removeEventListener('keydown', handleKeyDown);
}

function initSubcategoryClick(li) {
    const subId = li.dataset.subcategoryId;
    
    li.addEventListener('click', () => {
        const activeCategory = document.querySelector('.category-item.active')?.dataset.category;
        if (!activeCategory) return;
        
        if (activeSubcategory === subId) {
            subCategoriesContainer.querySelectorAll('.sub-item').forEach(item => {
                item.classList.remove('active');
            });
            activeSubcategory = null;
            updateWorks(activeCategory);
        } else {
            subCategoriesContainer.querySelectorAll('.sub-item').forEach(item => {
                item.classList.remove('active');
            });
            li.classList.add('active');
            activeSubcategory = subId;
            filterWorksBySubcategory(activeCategory, subId);
        }
    });
}

function init() {
    // 初始化主分类点击事件
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            switchCategory(item.dataset.category);
        });
    });

    // 初始化初始子分类的点击事件
    subCategoriesContainer.querySelectorAll('.sub-item').forEach(li => {
        const subName = li.textContent.trim();
        const category = categoryData['smart-city'];
        if (category) {
            const sub = category.subcategories.find(s => typeof s === 'object' ? s.name === subName : s === subName);
            if (sub && typeof sub === 'object') {
                li.dataset.subcategoryId = sub.id;
            }
        }
        initSubcategoryClick(li);
    });

    // 初始化作品图片点击事件
    document.querySelectorAll('.work-image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const workItem = wrapper.closest('.work-item');
            openGallery(workItem);
        });
    });
}

document.addEventListener('DOMContentLoaded', init);

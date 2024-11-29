import Youtube from '@tiptap/extension-youtube';

function getEmbedURL(input) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([^&\?]+)/;
  const match = input.match(regex);
  const videoId = match ? match[1] : null;
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
}

function removeStyleProperties(styleString, propertiesToRemove) {
  const style = styleString
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const filteredStyle = style.filter((s) => {
    const [prop] = s.split(':').map((s) => s.trim().toLowerCase());
    return !propertiesToRemove.includes(prop);
  });
  return filteredStyle.join('; ');
}

export const YoutubeResize = Youtube.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      containerStyle: {
        default: 'width: 100%; height: auto; cursor: pointer;',
        parseHTML: (element) => element.getAttribute('style') || '',
        renderHTML: () => null,
      },
      iframeStyle: {
        default: 'width: 100%; height: auto;',
        parseHTML: (element) => element.querySelector('iframe')?.getAttribute('style') || '',
        renderHTML: () => null,
      },
      style: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => null,
      },
      title: {
        default: null,
      },
      loading: {
        default: null,
      },
      srcset: {
        default: null,
      },
      sizes: {
        default: null,
      },
      crossorigin: {
        default: null,
      },
      usemap: {
        default: null,
      },
      ismap: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      referrerpolicy: {
        default: null,
      },
      longdesc: {
        default: null,
      },
      decoding: {
        default: null,
      },
      class: {
        default: null,
      },
      id: {
        default: null,
      },
      name: {
        default: null,
      },
      draggable: {
        default: true,
      },
      tabindex: {
        default: null,
      },
      'aria-label': {
        default: null,
      },
      'aria-labelledby': {
        default: null,
      },
      'aria-describedby': {
        default: null,
      },
    };
  },

  addCommands() {
    return {
      setYoutubeVideo: (options) => ({ commands }) => {
        const src = getEmbedURL(options.src);
        if (!src) {
          return false;
        }
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...options,
            src,
          },
        });
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { containerStyle, iframeStyle } = node.attrs;

    return [
      'div',
      { style: containerStyle },
      [
        'iframe',
        {
          ...HTMLAttributes,
          style: iframeStyle,
        },
      ],
    ];
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (element) => {
          const containerStyle = element.getAttribute('style') || '';
          const iframe = element.querySelector('iframe');
          const iframeStyle = iframe?.getAttribute('style') || '';

          const attrs = {
            containerStyle,
            iframeStyle,
            src: iframe?.getAttribute('src') || null,
            alt: iframe?.getAttribute('alt') || null,
            title: iframe?.getAttribute('title') || null,
          };
          return attrs;
        },
      },
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const {
        view,
        options: { editable },
      } = editor;
      const { style } = node.attrs;
      const $wrapper = document.createElement('div');
      const $container = document.createElement('div');
      const $iframe = document.createElement('iframe');
      const iconStyle = 'width: 24px; height: 24px; cursor: pointer;';

      const dispatchNodeView = () => {
        if (typeof getPos === 'function') {
          const tempContainerStyle = $container.style.cssText;
          const tempIframeStyle = $iframe.style.cssText;
          const containerStyle = removeStyleProperties(tempContainerStyle, ['border']);
          const iframeStyle = removeStyleProperties(tempIframeStyle, ['pointer-events']);
          const newAttrs = {
            ...node.attrs,
            containerStyle,
            iframeStyle,
          };
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
        }
      };
      const paintPositionContoller = () => {
        const $postionController = document.createElement('div');

        const $leftController = document.createElement('img');
        const $centerController = document.createElement('img');
        const $rightController = document.createElement('img');

        const controllerMouseOver = (e) => {
          e.target.style.opacity = 0.3;
        };

        const controllerMouseOut = (e) => {
          e.target.style.opacity = 1;
        };

        $postionController.setAttribute(
          'style',
          'position: absolute; top: 0%; left: 50%; width: 100px; height: 25px; z-index: 999; background-color: rgba(255, 255, 255, 0.7); border-radius: 4px; border: 2px solid #6C6C6C; cursor: pointer; transform: translate(-50%, -50%); display: flex; justify-content: space-between; align-items: center; padding: 0 10px;'
        );

        $leftController.setAttribute(
          'src',
          'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg'
        );
        $leftController.setAttribute('style', iconStyle);
        $leftController.addEventListener('mouseover', controllerMouseOver);
        $leftController.addEventListener('mouseout', controllerMouseOut);

        $centerController.setAttribute(
          'src',
          'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_center/default/20px.svg'
        );
        $centerController.setAttribute('style', iconStyle);
        $centerController.addEventListener('mouseover', controllerMouseOver);
        $centerController.addEventListener('mouseout', controllerMouseOut);

        $rightController.setAttribute(
          'src',
          'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg'
        );
        $rightController.setAttribute('style', iconStyle);
        $rightController.addEventListener('mouseover', controllerMouseOver);
        $rightController.addEventListener('mouseout', controllerMouseOut);

        $leftController.addEventListener('click', () => {
          $container.setAttribute('style', `${$container.style.cssText} margin: 0 auto 0 0;`);
          dispatchNodeView();
        });
        $centerController.addEventListener('click', () => {
          $container.setAttribute('style', `${$container.style.cssText} margin: 0 auto;`);
          dispatchNodeView();
        });
        $rightController.addEventListener('click', () => {
          $container.setAttribute('style', `${$container.style.cssText} margin: 0 0 0 auto;`);
          dispatchNodeView();
        });

        $postionController.appendChild($leftController);
        $postionController.appendChild($centerController);
        $postionController.appendChild($rightController);

        $container.appendChild($postionController);
      };

      $wrapper.setAttribute('style', `display: flex;`);
      $wrapper.appendChild($container);

      $container.setAttribute('style', node.attrs.containerStyle);
      $iframe.setAttribute('style', node.attrs.iframeStyle);
      if (editable) {
        $iframe.style.pointerEvents = 'none';
      }

      $iframe.style.display = 'inline-block';
      $iframe.style.maxWidth = '100%';
      if (!$iframe.style.width) {
        $iframe.style.width = '560px';
      }
      $iframe.style.height = $iframe.style.height || '315px';

      
      $container.appendChild($iframe);

      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key !== 'style' && key !== 'containerStyle' && key !== 'iframeStyle') {
          $iframe.setAttribute(key, value);
        }
      });

      $iframe.style.pointerEvents = 'none';
      

      if (!editable) return { dom: $iframe };
      const isMobile = document.documentElement.clientWidth < 768;
      const dotPosition = isMobile ? '-8px' : '-4px';
      const dotsPosition = [
        `top: ${dotPosition}; left: ${dotPosition}; cursor: nwse-resize;`,
        `top: ${dotPosition}; right: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; left: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; right: ${dotPosition}; cursor: nwse-resize;`,
      ];

      let isResizing = false;
      let startX: number, startWidth: number;

      $container.addEventListener('click', (e) => {
        //remove remaining dots and position controller
        const isMobile = document.documentElement.clientWidth < 768;
        isMobile && (document.querySelector('.ProseMirror-focused') as HTMLElement)?.blur();

        if ($container.childElementCount > 3) {
          for (let i = 0; i < 5; i++) {
            $container.removeChild($container.lastChild as Node);
          }
        }

        paintPositionContoller();

        // $container.setAttribute(
        //   'style',
        //   `position: relative; border: 1px dashed #6C6C6C; ${style} cursor: pointer;`
        // );

        $container.style.position = 'relative';
        $container.style.border = '1px dashed #6C6C6C';
        $container.style.cursor = 'pointer';

        Array.from({ length: 4 }, (_, index) => {
          const $dot = document.createElement('div');
          $dot.setAttribute(
            'style',
            `position: absolute; width: ${isMobile ? 16 : 9}px; height: ${isMobile ? 16 : 9}px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]}`
          );

          $dot.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $container.offsetWidth;

            const onMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              const deltaX = index % 2 === 0 ? -(e.clientX - startX) : e.clientX - startX;

              const newWidth = startWidth + deltaX;

              $container.style.width = newWidth + 'px';

              $iframe.style.width = '100%';
            };

            const onMouseUp = () => {
              if (isResizing) {
                isResizing = false;
              }
              dispatchNodeView();

              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });

          $dot.addEventListener(
            'touchstart',
            (e) => {
              e.cancelable && e.preventDefault();
              isResizing = true;
              startX = e.touches[0].clientX;
              startWidth = $container.offsetWidth;

              const onTouchMove = (e: TouchEvent) => {
                if (!isResizing) return;
                const deltaX =
                  index % 2 === 0
                    ? -(e.touches[0].clientX - startX)
                    : e.touches[0].clientX - startX;

                const newWidth = startWidth + deltaX;

                $container.style.width = newWidth + 'px';

                $iframe.style.width = '100%';
              };

              const onTouchEnd = () => {
                if (isResizing) {
                  isResizing = false;
                }
                dispatchNodeView();

                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
              };

              document.addEventListener('touchmove', onTouchMove);
              document.addEventListener('touchend', onTouchEnd);
            },
            { passive: false }
          );
          $container.appendChild($dot);
        });
      });

      document.addEventListener('click', (e: MouseEvent) => {
        const $target = e.target as HTMLElement;
        const isClickInside = $container.contains($target) || $target.style.cssText === iconStyle;

        if (!isClickInside) {
          const containerStyle = $container.getAttribute('style');
          $container.setAttribute('style', containerStyle as string);
          $container.style.border = '';

          if ($container.childElementCount > 3) {
            for (let i = 0; i < 5; i++) {
              $container.removeChild($container.lastChild as Node);
            }
          }
        }
      });

      return {
        dom: $wrapper,
      };
    };
  },
});
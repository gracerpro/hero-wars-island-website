/**
 * @param {Object} info
 * @param {Object|null} ssrContext
 */
export function setMetaInfo(info, ssrContext) {
  if (import.meta.env.SSR) {
    if (ssrContext) {
      ssrContext.page = {
        title: info.title !== undefined ? info.title : null,
        description: info.description !== undefined ? info.description : null,
        keywords: info.keywords !== undefined ? info.keywords : null,
      };
    }
  } else {
    if (info.title !== undefined) {
      document.title = info.title;
    }

    if (info.description !== undefined) {
      const descriptionEl = document.querySelector("head meta[name='description']");
      if (!descriptionEl) {
        createMeta("description", info.description);
      } else {
        descriptionEl.setAttribute("content", info.description);
      }
    }

    if (info.keywords !== undefined) {
      const keywordsEl = document.querySelector("head meta[name='keywords']");
      if (!keywordsEl) {
        createMeta("keywords", info.keywords);
      } else {
        keywordsEl.setAttribute("content", info.keywords);
      }
    }
  }
}

function createMeta(name, content) {
  var meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.getElementsByTagName("head")[0].appendChild(meta);
}

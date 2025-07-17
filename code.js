figma.showUI(__html__, { width: 650, height: 400 });

figma.ui.onmessage = async msg => {
  if (msg.type === 'svg') {
    const node = figma.createNodeFromSvg(msg.data);
    figma.currentPage.appendChild(node);
    node.x = figma.viewport.center.x - node.width / 2;
    node.y = figma.viewport.center.y - node.height / 2;

    if (!msg.stayOpen) {
      figma.closePlugin();
    }
  }
};
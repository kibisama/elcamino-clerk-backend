const reloadCardinal = async (req, res) => {
  const { clickHomeLink } = req.app.get('cardinalPuppet');
  // Home 링크를 클릭하여 Cardinal 웹앱의 로그인 상태를 연장합니다.
  await clickHomeLink();
  res.sendStatus(200);
};

module.exports = reloadCardinal;

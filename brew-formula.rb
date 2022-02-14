require "language/node"

class j5ffmpeg < Formula
  desc "Johnny Marnell's cli scripts"
  homepage "https://github.com/johnnymarnell/j5-scripts"
  url "https://registry.npmjs.org/foo/-/foo-1.4.2.tgz"
  sha256 "..."

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    # todo
  end
end
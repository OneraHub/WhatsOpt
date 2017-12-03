FROM drecom/ubuntu-ruby:2.3.3
MAINTAINER remi.lafage@onera.fr

#ENV http_proxy=http://proxy.onecert.fr:80
#ENV https_proxy=http://proxy.onecert.fr:80

# sqlite
RUN apt-get update && apt-get install -y \ 
	sqlite3 libsqlite3-dev
  
# Python
RUN apt-get install -y \ 
  python2.7 \
  python-pip \
  python-dev 

RUN pip install --upgrade pip
RUN pip install jupyter
RUN pip install openmdao==2.0.2

# node
RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

# gpg keys listed at https://github.com/nodejs/node#release-team
RUN set -ex \
  && for key in \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --keyserver pgp.mit.edu --recv-keys "$key" || \
    gpg --keyserver keyserver.pgp.com --recv-keys "$key" ; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.10.3

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ENV YARN_VERSION 0.24.5

RUN set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --keyserver pgp.mit.edu --recv-keys "$key" || \
    gpg --keyserver keyserver.pgp.com --recv-keys "$key" ; \
  done \
  && curl -fSL -o yarn.js "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-legacy-$YARN_VERSION.js" \
  && curl -fSL -o yarn.js.asc "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-legacy-$YARN_VERSION.js.asc" \
  && gpg --batch --verify yarn.js.asc yarn.js \
  && rm yarn.js.asc \
  && mv yarn.js /usr/local/bin/yarn \
  && chmod +x /usr/local/bin/yarn  

# OpenVSP
RUN apt-get install -y git cmake libxml2-dev \
			g++ libcpptest-dev libeigen3-dev \
			libcminpack-dev swig \
  && apt-get update \
  && mkdir OpenVSP \
  && cd OpenVSP \
  && mkdir repo \
  && git clone https://github.com/OpenVSP/OpenVSP.git repo \
  && mkdir build \
  && cd build \
  && echo $PWD \
  && cmake -DCMAKE_BUILD_TYPE=Release \
	-DVSP_USE_SYSTEM_CPPTEST=false \
	-DVSP_USE_SYSTEM_LIBXML2=true \
	-DVSP_USE_SYSTEM_EIGEN=false \
	-DVSP_USE_SYSTEM_CMINPACK=true \
	-DCMAKE_INSTALL_PREFIX=/usr/local/OpenVSP \
	-DVSP_NO_GRAPHICS=1 ../repo/SuperProject \
  && make 

RUN mkdir -p /whatsopt 
WORKDIR /whatsopt

COPY Gemfile Gemfile.lock ./ 
RUN bundle install --jobs 20 --retry 5

COPY . ./

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]